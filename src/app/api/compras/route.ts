import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { compraSchema } from "@/lib/validations/compra"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

const rol = String(session?.user?.rol || "")

if (!["ADMIN", "OPERADOR"].includes(rol)) {
  return NextResponse.json(
    { error: "Acceso denegado" },
    { status: 403 }
  )
}

  try {
    const entradas = await prisma.compra.findMany({
      include: {
        proveedor: {
          select: {
            nombreEmpresa: true,
          },
        },
        usuario: {
          select: {
            usuario: true,
          },
        },
        detalles: {
          include: {
            producto: {
              select: {
                id: true,
                codigo: true,
                nombreProducto: true,
                unidadMedida: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    })

    return NextResponse.json(entradas)
  } catch (error) {
    console.error("Error al obtener entradas de material:", error)

    return NextResponse.json(
      { error: "Error al obtener entradas de material" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const rol = String(session.user.rol || "")

  if (!["ADMIN", "OPERADOR"].includes(rol)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  try {
    const body = await req.json()

    const result = compraSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      )
    }

    const {
      idProveedor,
      numeroDocumento,
      tipoDocumento,
      descuento,
      items,
    } = result.data

    const subtotal = items.reduce(
      (acc, item) => acc + item.precioCompra * item.cantidad,
      0
    )

    const total = subtotal - (descuento ?? 0)

    const entrada = await prisma.$transaction(async (tx) => {
      const nuevaEntrada = await tx.compra.create({
        data: {
          idUsuario: session.user.id,
          idProveedor,
          numeroDocumento: numeroDocumento ?? null,
          tipoDocumento: tipoDocumento ?? "Ingreso de material",
          subtotal,
          descuento: descuento ?? 0,
          total,
          estado: "ACTIVO",
        },
      })

      for (const item of items) {
        const subtotalItem = item.precioCompra * item.cantidad

        await tx.detalleCompra.create({
          data: {
            idCompra: nuevaEntrada.id,
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            precioCompra: item.precioCompra,
            subtotal: subtotalItem,
          },
        })

        await tx.producto.update({
          where: {
            id: item.idProducto,
          },
          data: {
            stock: {
              increment: item.cantidad,
            },
            costo: item.precioCompra,
          },
        })

        await tx.movimientoInventario.create({
          data: {
            idProducto: item.idProducto,
            idUsuario: session.user.id,
            idCompra: nuevaEntrada.id,
            tipo: "ENTRADA",
            origen: "RECEPCION_MATERIAL",
            cantidad: item.cantidad,
            descripcion: `Entrada de material #${nuevaEntrada.id} - Proveedor ID ${idProveedor}`,
          },
        })
      }

      return nuevaEntrada
    })

    return NextResponse.json(entrada, { status: 201 })
  } catch (error) {
    console.error("Error al registrar entrada de material:", error)

    return NextResponse.json(
      { error: "Error al registrar entrada de material" },
      { status: 500 }
    )
  }
}