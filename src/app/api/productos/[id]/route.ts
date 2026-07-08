import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function limpiarTexto(valor: unknown) {
  if (typeof valor !== "string") return null
  const limpio = valor.trim()
  return limpio.length > 0 ? limpio : null
}

function limpiarFecha(valor: unknown) {
  if (typeof valor !== "string") return null
  if (!valor.trim()) return null
  return new Date(valor)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) },
      include: { categoria: true },
    })

    if (!producto) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error al obtener material:", error)

    return NextResponse.json(
      { error: "Error al obtener material" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const actualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        idCategoriaProducto: Number(body.idCategoriaProducto),

        nombreProducto: body.nombreProducto,
        codigo: limpiarTexto(body.codigo),
        unidadMedida: limpiarTexto(body.unidadMedida) ?? "Unidad",
        ubicacion: limpiarTexto(body.ubicacion),
        fechaVencimiento: limpiarFecha(body.fechaVencimiento),
        observacion: limpiarTexto(body.observacion),

        marca: body.marca || "Inventario MKT",
        talla: body.talla || "N/A",
        color: body.color || "N/A",
        temporada: body.temporada || "TODO_EL_ANNO",

        precioVenta: Number(body.precioVenta ?? 0),
        costo: Number(body.costo ?? 0),
        margen: Number(body.margen ?? 0),
        stock: Number(body.stock ?? 0),
        stockMinimo: Number(body.stockMinimo ?? 0),
        estado: body.estado || "ACTIVO",
      },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error("Error al actualizar material:", error)

    return NextResponse.json(
      { error: "Error al actualizar material" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const estado: "ACTIVO" | "INACTIVO" = body.estado ?? "INACTIVO"

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: { estado },
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error al cambiar estado del material:", error)

    return NextResponse.json(
      { error: "Error al cambiar estado del material" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.producto.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: "Material eliminado" })
  } catch (error) {
    console.error("Error al eliminar material:", error)

    return NextResponse.json(
      { error: "Error al eliminar material" },
      { status: 500 }
    )
  }
}
