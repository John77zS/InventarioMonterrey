import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = parseInt(idParam)
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const sesionCaja = await prisma.sesionCaja.findUnique({
    where: { id },
    include: {
      ventas: {
        where: { estado: "COMPLETADA" },
        select: { total: true },
      },
    },
  })

  if (!sesionCaja) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  if (sesionCaja.idUsuario !== session.user.id) {
    return NextResponse.json(
      { error: "No autorizado para cerrar esta sesión" },
      { status: 403 }
    )
  }

  if (sesionCaja.estado !== "ABIERTA") {
    return NextResponse.json({ error: "La sesión ya está cerrada" }, { status: 409 })
  }

  const montoFinal = Number(sesionCaja.montoInicial) + sesionCaja.ventas.reduce(
    (sum, venta) => sum + Number(venta.total),
    0
  )

  const sesionCerrada = await prisma.sesionCaja.update({
    where: { id },
    data: {
      horaCierre: new Date(),
      montoFinal,
      estado: "CERRADA",
    },
  })

  return NextResponse.json({ sesion: sesionCerrada })
}
