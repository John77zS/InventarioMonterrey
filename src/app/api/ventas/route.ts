import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const salidaSchema = z.object({
  idCliente: z.number().int().positive(),
  motivo: z.string().min(5, "El motivo debe tener al menos 5 caracteres"),
  fotoUrl: z.string().optional().nullable(),
  observacionFoto: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        idProducto: z.number().int().positive(),
        cantidad: z.number().int().positive(),
      })
    )
    .min(1, "Debes agregar al menos un material"),
})

const salidaInclude = {
  cliente: true,
  usuario: {
    select: {
      id: true,
      usuario: true,
    },
  },
  tipoPago: true,
  detalles: {
    include: {
      producto: {
        select: {
          id: true,
          codigo: true,
          nombreProducto: true,
          unidadMedida: true,
          ubicacion: true,
          talla: true,
          color: true,
        },
      },
    },
  },
} as const

async function obtenerTipoPagoDefault() {
  const tipoExistente = await prisma.tipoPago.findFirst()

  if (tipoExistente) {
    return tipoExistente
  }

  return prisma.tipoPago.create({
    data: {
      tipoMetodo: "EFECTIVO",
      moneda: "BOB",
    },
  })
}

async function obtenerSesionInventario(idUsuario: number) {
  const sesionAbierta = await prisma.sesionCaja.findFirst({
    where: {
      idUsuario,
      estado: "ABIERTA",
    },
  })

  if (sesionAbierta) {
    return sesionAbierta
  }

  return prisma.sesionCaja.create({
    data: {
      idUsuario,
      montoInicial: 0,
      estado: "ABIERTA",
    },
  })
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const where =
      session.user.rol === "ADMIN"
        ? {}
        : {
            idUsuario: session.user.id,
          }

    const salidas = await prisma.venta.findMany({
      where,
      include: salidaInclude,
      orderBy: {
        fecha: "desc",
      },
      take: 300,
    })

    return NextResponse.json(salidas)
  } catch (error) {
    console.error("Error al obtener salidas de material:", error)

    return NextResponse.json(
      { error: "Error al obtener salidas de material" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = salidaSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      )
    }

      const { idCliente, motivo, items, fotoUrl, observacionFoto } = result.data

    const area = await prisma.cliente.findUnique({
      where: {
        id: idCliente,
      },
      select: {
        id: true,
        nombre: true,
        apPaterno: true,
        estado: true,
      },
    })

    if (!area) {
      return NextResponse.json(
        { error: "Area solicitante no encontrada" },
        { status: 404 }
      )
    }

    if (area.estado !== "ACTIVO") {
      return NextResponse.json(
        { error: "El area solicitante esta inactiva" },
        { status: 400 }
      )
    }

    const productIds = items.map((i) => i.idProducto)

    const productos = await prisma.producto.findMany({
      where: {
        id: {
          in: productIds,
        },
        estado: "ACTIVO",
      },
      select: {
        id: true,
        codigo: true,
        nombreProducto: true,
        stock: true,
        costo: true,
        unidadMedida: true,
      },
    })

    const erroresStock: string[] = []

    for (const item of items) {
      const producto = productos.find((p) => p.id === item.idProducto)

      if (!producto) {
        erroresStock.push(`Material ID ${item.idProducto} no encontrado`)
      } else if (producto.stock < item.cantidad) {
        erroresStock.push(
          `${producto.nombreProducto} - stock disponible: ${producto.stock}`
        )
      }
    }

    if (erroresStock.length > 0) {
      return NextResponse.json(
        {
          error: "Stock insuficiente",
          items: erroresStock,
        },
        { status: 409 }
      )
    }

    const tipoPago = await obtenerTipoPagoDefault()
    const sesionCaja = await obtenerSesionInventario(session.user.id)

    const subtotal = items.reduce((acc, item) => {
      const producto = productos.find((p) => p.id === item.idProducto)
      const costo = Number(producto?.costo || 0)

      return acc + costo * item.cantidad
    }, 0)

    const salida = await prisma.$transaction(async (tx) => {
      const nuevaSalida = await tx.venta.create({
        data: {
          idCliente,
          idUsuario: session.user.id,
          idSesionCaja: sesionCaja.id,
          idTipoPago: tipoPago.id,
          estado: "COMPLETADA",
          subtotal,
          total: subtotal,
          detalles: {
            create: items.map((item) => {
              const producto = productos.find((p) => p.id === item.idProducto)
              const costo = Number(producto?.costo || 0)

              return {
                idProducto: item.idProducto,
                cantidad: item.cantidad,
                precio: costo,
                subtotal: costo * item.cantidad,
              }
            }),
          },
        },
        include: salidaInclude,
      })

      for (const item of items) {
        await tx.producto.update({
          where: {
            id: item.idProducto,
          },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        })

        await tx.movimientoInventario.create({
          data: {
            idProducto: item.idProducto,
            idUsuario: session.user.id,
            tipo: "SALIDA",
            origen: "ENTREGA_MATERIAL",
            cantidad: -item.cantidad,
            descripcion: `Entrega de material #${nuevaSalida.id} - Area: ${area.nombre} - Motivo: ${motivo}`,
            fotoUrl: fotoUrl || null,
            observacionFoto: observacionFoto || null,
          },
        })
      }

      return nuevaSalida
    })

    return NextResponse.json(salida, { status: 201 })
  } catch (error) {
    console.error("Error al registrar salida de material:", error)

    return NextResponse.json(
      { error: "Error al registrar salida de material" },
      { status: 500 }
    )
  }
}
