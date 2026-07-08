import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compraSchema } from "@/lib/validations/compra"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entrada = await prisma.compra.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        proveedor: true,
        usuario: true,
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
    })

    if (!entrada) {
      return NextResponse.json(
        { error: "Entrada de material no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(entrada)
  } catch (error) {
    console.error("Error al obtener entrada de material:", error)

    return NextResponse.json(
      { error: "Error al obtener entrada de material" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const validated = compraSchema.parse(body)

    const entrada = await prisma.compra.update({
      where: {
        id: Number(id),
      },
      data: {
        idProveedor: validated.idProveedor,
        numeroDocumento: validated.numeroDocumento ?? null,
        tipoDocumento: validated.tipoDocumento ?? "Ingreso de material",
        descuento: validated.descuento ?? 0,
      },
    })

    return NextResponse.json(entrada)
  } catch (error) {
    console.error("Error al actualizar entrada de material:", error)

    return NextResponse.json(
      { error: "Error al actualizar entrada de material" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idEntrada = Number(id)

    const entrada = await prisma.compra.findUnique({
      where: {
        id: idEntrada,
      },
      include: {
        detalles: true,
      },
    })

    if (!entrada) {
      return NextResponse.json(
        { error: "Entrada de material no encontrada" },
        { status: 404 }
      )
    }

    if (entrada.estado === "INACTIVO") {
      return NextResponse.json(
        { error: "La entrada ya se encuentra anulada" },
        { status: 400 }
      )
    }

    const entradaAnulada = await prisma.$transaction(async (tx) => {
      for (const detalle of entrada.detalles) {
        await tx.producto.update({
          where: {
            id: detalle.idProducto,
          },
          data: {
            stock: {
              decrement: detalle.cantidad,
            },
          },
        })

        await tx.movimientoInventario.create({
          data: {
            idProducto: detalle.idProducto,
            idUsuario: entrada.idUsuario,
            idCompra: entrada.id,
            tipo: "SALIDA",
            origen: "AJUSTE_MANUAL",
            cantidad: -detalle.cantidad,
            descripcion: `Anulación de entrada de material #${entrada.id}`,
          },
        })
      }

      return tx.compra.update({
        where: {
          id: entrada.id,
        },
        data: {
          estado: "INACTIVO",
        },
      })
    })

    return NextResponse.json({
      message: "Entrada de material anulada correctamente",
      entrada: entradaAnulada,
    })
  } catch (error) {
    console.error("Error al anular entrada de material:", error)

    return NextResponse.json(
      { error: "Error al anular entrada de material" },
      { status: 500 }
    )
  }
}