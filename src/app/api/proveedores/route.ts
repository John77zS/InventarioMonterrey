import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { proveedorSchema } from "@/lib/validations/proveedor"

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { nombreEmpresa: "asc" },
    })

    return NextResponse.json(proveedores)
  } catch (error) {
    console.error("Error al obtener proveedores:", error)

    return NextResponse.json(
      { error: "Error al obtener proveedores de materiales" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validatedData = proveedorSchema.parse({
      nombreEmpresa: body.nombreEmpresa?.trim(),
      representante: body.representante?.trim() || null,
      telefono: body.telefono?.trim() || "N/A",
      correo: body.correo?.trim() || null,
      ubicacion: body.ubicacion?.trim() || null,
    })

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        ...validatedData,
        estado: "ACTIVO",
      },
    })

    return NextResponse.json(nuevoProveedor, { status: 201 })
  } catch (error) {
    console.error("Error al crear proveedor:", error)

    return NextResponse.json(
      { error: "Error al registrar proveedor de materiales" },
      { status: 400 }
    )
  }
}