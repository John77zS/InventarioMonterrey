import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clienteSchema } from "@/lib/validations/cliente"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } })
  if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  return NextResponse.json(cliente)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const result = clienteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { nombre, apPaterno, apMaterno, telefono, correo } = result.data

  const cliente = await prisma.cliente.update({
    where: { id: Number(id) },
    data: {
      nombre,
      apPaterno,
      apMaterno: apMaterno || null,
      telefono,
      correo: correo || null,
    },
  })

  return NextResponse.json(cliente)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  if (body.estado !== "ACTIVO" && body.estado !== "INACTIVO") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  const cliente = await prisma.cliente.update({
    where: { id: Number(id) },
    data: { estado: body.estado },
  })

  return NextResponse.json(cliente)
}
