import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (session.user.rol !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 })

  const params = req.nextUrl.searchParams
  const desdeStr = params.get("desde")
  const hastaStr = params.get("hasta")
  const tipoPagoParam = params.get("tipoPago")

  if (!desdeStr || !hastaStr) {
    return NextResponse.json({ error: "Parámetros desde y hasta requeridos" }, { status: 400 })
  }

  const desde = new Date(`${desdeStr}T00:00:00.000Z`)
  const hasta = new Date(`${hastaStr}T23:59:59.999Z`)

  const where: Record<string, unknown> = {
    estado: "COMPLETADA",
    fecha: { gte: desde, lte: hasta },
  }
  if (tipoPagoParam && tipoPagoParam !== "all") {
    where.idTipoPago = Number(tipoPagoParam)
  }

  const ventas = await prisma.venta.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true, apPaterno: true, apMaterno: true } },
      usuario: { select: { id: true, usuario: true } },
      tipoPago: { select: { id: true, tipoMetodo: true } },
      detalles: {
        include: { producto: { select: { id: true, nombreProducto: true, talla: true, color: true } } },
      },
    },
    orderBy: { fecha: "desc" },
  })

  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0)
  const cantidadVentas = ventas.length
  const ticketPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0

  const porTipoPagoMap = new Map<string, { metodo: string; cantidad: number; total: number }>()
  const porDiaMap = new Map<string, { fecha: string; total: number; cantidad: number }>()

  for (const v of ventas) {
    const metodo = v.tipoPago.tipoMetodo
    const existing = porTipoPagoMap.get(metodo)
    if (existing) {
      existing.cantidad++
      existing.total += Number(v.total)
    } else {
      porTipoPagoMap.set(metodo, { metodo, cantidad: 1, total: Number(v.total) })
    }

    const fechaKey = new Date(v.fecha).toISOString().split("T")[0]
    const dia = porDiaMap.get(fechaKey)
    if (dia) {
      dia.cantidad++
      dia.total += Number(v.total)
    } else {
      porDiaMap.set(fechaKey, { fecha: fechaKey, total: Number(v.total), cantidad: 1 })
    }
  }

  const ventasPorDia = Array.from(porDiaMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))

  return NextResponse.json({
    ventas,
    resumen: {
      totalVentas,
      cantidadVentas,
      ticketPromedio,
      ventasPorTipoPago: Array.from(porTipoPagoMap.values()),
      ventasPorDia,
    },
  })
}
