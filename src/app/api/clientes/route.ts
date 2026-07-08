import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clienteSchema } from "@/lib/validations/cliente"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          estado: "ACTIVO",
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { apPaterno: { contains: q, mode: "insensitive" } },
            { apMaterno: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q } },
          ],
        }
      : {},
    take: q ? 20 : undefined,
    orderBy: [{ apPaterno: "asc" }, { nombre: "asc" }],
  })

  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const result = clienteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { nombre, apPaterno, apMaterno, telefono, correo } = result.data

  const cliente = await prisma.cliente.create({
    data: {
      nombre,
      apPaterno,
      apMaterno: apMaterno || null,
      telefono,
      correo: correo || null,
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}
