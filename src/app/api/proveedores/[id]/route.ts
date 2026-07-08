import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { proveedorSchema } from "@/lib/validations/proveedor"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const proveedor = await prisma.proveedor.findUnique({
      where: { id: Number(id) },
    })

    if (!proveedor) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error("Error al buscar proveedor:", error)

    return NextResponse.json(
      { error: "Error al buscar proveedor de materiales" },
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

    const validatedData = proveedorSchema.parse({
      nombreEmpresa: body.nombreEmpresa?.trim(),
      representante: body.representante?.trim() || null,
      telefono: body.telefono?.trim() || "N/A",
      correo: body.correo?.trim() || null,
      ubicacion: body.ubicacion?.trim() || null,
    })

    const proveedorActualizado = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: validatedData,
    })

    return NextResponse.json(proveedorActualizado)
  } catch (error) {
    console.error("Error al actualizar proveedor:", error)

    return NextResponse.json(
      { error: "Error al actualizar proveedor de materiales" },
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

    const proveedor = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: { estado },
    })

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error("Error al cambiar estado del proveedor:", error)

    return NextResponse.json(
      { error: "Error al cambiar estado del proveedor" },
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

    const proveedor = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: { estado: "INACTIVO" },
    })

    return NextResponse.json({
      message: "Proveedor desactivado correctamente",
      proveedor,
    })
  } catch (error) {
    console.error("Error al desactivar proveedor:", error)

    return NextResponse.json(
      { error: "No se pudo desactivar el proveedor" },
      { status: 400 }
    )
  }
}