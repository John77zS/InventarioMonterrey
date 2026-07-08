import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { abrirCajaSchema } from "@/lib/validations/sesion-caja"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const sesionActiva = await prisma.sesionCaja.findFirst({
    where: {
      idUsuario: session.user.id,
      estado: "ABIERTA",
    },
    include: {
      ventas: {
        where: { estado: "COMPLETADA" },
        select: { total: true },
      },
    },
  })

  return NextResponse.json({ sesion: sesionActiva })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const result = abrirCajaSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const sesionExistente = await prisma.sesionCaja.findFirst({
    where: { idUsuario: session.user.id, estado: "ABIERTA" },
  })
  if (sesionExistente) {
    return NextResponse.json(
      { error: "Ya tienes una sesión de caja abierta" },
      { status: 409 }
    )
  }

  const nuevaSesion = await prisma.sesionCaja.create({
    data: {
      idUsuario: session.user.id,
      montoInicial: result.data.montoInicial,
      estado: "ABIERTA",
    },
  })

  return NextResponse.json({ sesion: nuevaSesion }, { status: 201 })
}
