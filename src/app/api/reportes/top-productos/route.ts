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
  const categoriaParam = params.get("categoria")
  const limit = Number(params.get("limit") || "20")

  if (!desdeStr || !hastaStr) {
    return NextResponse.json({ error: "Parámetros desde y hasta requeridos" }, { status: 400 })
  }

  const desde = new Date(`${desdeStr}T00:00:00.000Z`)
  const hasta = new Date(`${hastaStr}T23:59:59.999Z`)

  const detalleWhere: Record<string, unknown> = {
    venta: { estado: "COMPLETADA", fecha: { gte: desde, lte: hasta } },
  }
  if (categoriaParam && categoriaParam !== "all") {
    detalleWhere.producto = { idCategoriaProducto: Number(categoriaParam) }
  }

  const detalles = await prisma.detalleVenta.findMany({
    where: detalleWhere,
    include: {
      producto: {
        select: {
          id: true,
          nombreProducto: true,
          talla: true,
          color: true,
          marca: true,
          costo: true,
          categoria: { select: { nombreCategoria: true } },
        },
      },
    },
  })

  const productMap = new Map<number, {
    id: number; nombreProducto: string; talla: string; color: string
    marca: string | null; categoria: string; cantidadVendida: number
    totalVendido: number; costoTotal: number
  }>()

  for (const det of detalles) {
    const p = det.producto
    const subtotal = Number(det.subtotal)
    const costoUnitario = Number(p.costo)
    const existing = productMap.get(p.id)

    if (existing) {
      existing.cantidadVendida += det.cantidad
      existing.totalVendido += subtotal
      existing.costoTotal += costoUnitario * det.cantidad
    } else {
      productMap.set(p.id, {
        id: p.id,
        nombreProducto: p.nombreProducto,
        talla: p.talla,
        color: p.color,
        marca: p.marca,
        categoria: p.categoria.nombreCategoria,
        cantidadVendida: det.cantidad,
        totalVendido: subtotal,
        costoTotal: costoUnitario * det.cantidad,
      })
    }
  }

  const ranking = Array.from(productMap.values())
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, limit)
    .map((p, i) => ({
      posicion: i + 1,
      ...p,
      ganancia: p.totalVendido - p.costoTotal,
      margenPorcentaje: p.totalVendido > 0 ? ((p.totalVendido - p.costoTotal) / p.totalVendido) * 100 : 0,
    }))

  return NextResponse.json(ranking)
}
