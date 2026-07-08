import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type Segmento = "FRECUENTE" | "OCASIONAL" | "NUEVO"

function calcularSegmento(totalCompras: number): Segmento {
  if (totalCompras >= 5) return "FRECUENTE"
  if (totalCompras >= 2) return "OCASIONAL"
  if (totalCompras === 1) return "NUEVO"
  return "NUEVO"
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        ventas: {
          where: { estado: "COMPLETADA" },
          select: { total: true },
        },
      },
      orderBy: [{ apPaterno: "asc" }, { nombre: "asc" }],
    })

    const resultado = clientes.map((c) => {
      const totalCompras = c.ventas.length
      const montoAcumulado = c.ventas.reduce((acc, v) => acc + Number(v.total), 0)
      const ticketPromedio = totalCompras > 0 ? montoAcumulado / totalCompras : 0
      const segmento = calcularSegmento(totalCompras)

      return {
        id: c.id,
        nombre: c.nombre,
        apPaterno: c.apPaterno,
        apMaterno: c.apMaterno,
        telefono: c.telefono,
        correo: c.correo,
        estado: c.estado,
        totalCompras,
        montoAcumulado,
        ticketPromedio,
        segmento,
      }
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener segmentación" }, { status: 500 })
  }
}
