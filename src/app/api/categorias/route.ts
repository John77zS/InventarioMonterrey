import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoriaSchema } from "@/lib/validations/categoria"

export async function GET() {
  try {
    const categorias = await prisma.categoriaProducto.findMany({
      orderBy: { nombreCategoria: "asc" },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Error al obtener categorias:", error)

    return NextResponse.json(
      { error: "Error al obtener categorias de materiales" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validated = categoriaSchema.parse({
      nombreCategoria: body.nombreCategoria?.trim(),
      descripcion: body.descripcion?.trim() || null,
    })

    const categoria = await prisma.categoriaProducto.create({
      data: {
        nombreCategoria: validated.nombreCategoria,
        descripcion: validated.descripcion,
        estado: "ACTIVO",
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error("Error al crear categoria:", error)

    return NextResponse.json(
      { error: "Error al crear categoria de material" },
      { status: 500 }
    )
  }
}
