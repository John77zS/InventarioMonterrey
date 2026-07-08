import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const movimientos = await prisma.movimientoInventario.findMany({
      include: {
        producto: {
          select: {
            id: true,
            codigo: true,
            nombreProducto: true,
            unidadMedida: true,
            ubicacion: true,
            talla: true,
            color: true,
          },
        },
        usuario: {
          select: {
            id: true,
            usuario: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
      take: 300,
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error("Error al obtener movimientos de inventario:", error)

    return NextResponse.json(
      { error: "Error al obtener movimientos de inventario" },
      { status: 500 }
    )
  }
}
