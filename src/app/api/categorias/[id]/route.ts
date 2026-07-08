import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoriaSchema } from "@/lib/validations/categoria"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const validated = categoriaSchema.parse({
      nombreCategoria: body.nombreCategoria?.trim(),
      descripcion: body.descripcion?.trim() || null,
    })

    const categoria = await prisma.categoriaProducto.update({
      where: { id: Number(id) },
      data: {
        nombreCategoria: validated.nombreCategoria,
        descripcion: validated.descripcion,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("Error al actualizar categoria:", error)

    return NextResponse.json(
      { error: "Error al actualizar categoria de material" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const estado: "ACTIVO" | "INACTIVO" = body.estado ?? "INACTIVO"

    const categoria = await prisma.categoriaProducto.update({
      where: { id: Number(id) },
      data: { estado },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("Error al cambiar estado de categoria:", error)

    return NextResponse.json(
      { error: "Error al cambiar estado de categoria de material" },
      { status: 500 }
    )
  }
}
