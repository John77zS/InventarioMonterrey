import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = session.user.rol === "ADMIN"

  const sesiones = await prisma.sesionCaja.findMany({
    where: isAdmin ? {} : { idUsuario: session.user.id },
    include: {
      usuario: { select: { id: true, usuario: true } },
      ventas: {
        select: { total: true, estado: true },
      },
    },
    orderBy: { horaApertura: "desc" },
    take: 100,
  })

  const data = sesiones.map((s) => {
    const ventasCompletadas = s.ventas.filter((v) => v.estado === "COMPLETADA")
    const ventasAnuladas = s.ventas.filter((v) => v.estado === "ANULADA")
    const totalVendido = ventasCompletadas.reduce((acc, v) => acc + Number(v.total), 0)

    let duracionMin: number | null = null
    if (s.horaCierre) {
      duracionMin = Math.round(
        (s.horaCierre.getTime() - s.horaApertura.getTime()) / 60000
      )
    }

    return {
      id: s.id,
      usuario: s.usuario,
      horaApertura: s.horaApertura.toISOString(),
      horaCierre: s.horaCierre?.toISOString() ?? null,
      montoInicial: Number(s.montoInicial),
      montoFinal: s.montoFinal ? Number(s.montoFinal) : null,
      estado: s.estado,
      cantidadVentas: ventasCompletadas.length,
      cantidadAnuladas: ventasAnuladas.length,
      totalVendido,
      duracionMin,
    }
  })

  return NextResponse.json(data)
}
