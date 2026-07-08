import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getInicioPeriodo(periodo: string) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (periodo === "dia") {
    return hoy
  }

  if (periodo === "semana") {
    const inicio = new Date(hoy)
    inicio.setDate(inicio.getDate() - 7)
    return inicio
  }

  const inicioMes = new Date(hoy)
  inicioMes.setMonth(inicioMes.getMonth() - 1)
  return inicioMes
}

function getInicioAnterior(inicioActual: Date, periodo: string) {
  const inicioAnterior = new Date(inicioActual)

  if (periodo === "dia") {
    inicioAnterior.setDate(inicioAnterior.getDate() - 1)
    return inicioAnterior
  }

  if (periodo === "semana") {
    inicioAnterior.setDate(inicioAnterior.getDate() - 7)
    return inicioAnterior
  }

  inicioAnterior.setMonth(inicioAnterior.getMonth() - 1)
  return inicioAnterior
}

function calcularPorcentajeCambio(actual: number, anterior: number) {
  if (anterior === 0) {
    return actual > 0 ? 100 : 0
  }

  return ((actual - anterior) / anterior) * 100
}

function getFechaKey(fecha: Date) {
  return fecha.toISOString().slice(0, 10)
}

function calcularValorMovimiento(movimiento: {
  cantidad: number
  producto: {
    costo: unknown
  }
}) {
  return Math.abs(Number(movimiento.cantidad || 0)) * Number(movimiento.producto.costo || 0)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const periodo = req.nextUrl.searchParams.get("periodo") || "mes"

    const inicioActual = getInicioPeriodo(periodo)
    const inicioAnterior = getInicioAnterior(inicioActual, periodo)

    const productos = await prisma.producto.findMany({
      where: {
        estado: "ACTIVO",
      },
      select: {
        id: true,
        codigo: true,
        nombreProducto: true,
        unidadMedida: true,
        ubicacion: true,
        stock: true,
        stockMinimo: true,
        costo: true,
        talla: true,
        color: true,
      },
      orderBy: {
        nombreProducto: "asc",
      },
    })

    const movimientosPeriodo = await prisma.movimientoInventario.findMany({
      where: {
        fecha: {
          gte: inicioActual,
        },
      },
      include: {
        producto: {
          select: {
            id: true,
            codigo: true,
            nombreProducto: true,
            unidadMedida: true,
            ubicacion: true,
            stock: true,
            stockMinimo: true,
            costo: true,
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
        fecha: "asc",
      },
    })

    const movimientosAnterior = await prisma.movimientoInventario.findMany({
      where: {
        fecha: {
          gte: inicioAnterior,
          lt: inicioActual,
        },
      },
      include: {
        producto: {
          select: {
            id: true,
            costo: true,
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    })

    const totalMateriales = productos.length

    const materialesConStock = productos.filter(
      (p) => Number(p.stock || 0) > 0
    ).length

    const materialesSinStock = productos.filter(
      (p) => Number(p.stock || 0) === 0
    ).length

    const productosStockCriticoList = productos.filter(
      (p) => Number(p.stock || 0) <= Number(p.stockMinimo || 0)
    )

    const productosStockCritico = productosStockCriticoList.length

    const totalUnidades = productos.reduce(
      (acc, p) => acc + Number(p.stock || 0),
      0
    )

    const valorInventario = productos.reduce(
      (acc, p) => acc + Number(p.stock || 0) * Number(p.costo || 0),
      0
    )

    const entradasPeriodo = movimientosPeriodo.filter(
      (m) => m.tipo === "ENTRADA"
    )

    const salidasPeriodo = movimientosPeriodo.filter(
      (m) => m.tipo === "SALIDA"
    )

    const ajustesPeriodo = movimientosPeriodo.filter(
      (m) => m.tipo === "AJUSTE"
    )

    const valorEntradas = entradasPeriodo.reduce(
      (acc, m) => acc + calcularValorMovimiento(m),
      0
    )

    const valorSalidas = salidasPeriodo.reduce(
      (acc, m) => acc + calcularValorMovimiento(m),
      0
    )

    const valorEntradasAnterior = movimientosAnterior
      .filter((m) => m.tipo === "ENTRADA")
      .reduce((acc, m) => acc + calcularValorMovimiento(m), 0)

    const valorSalidasAnterior = movimientosAnterior
      .filter((m) => m.tipo === "SALIDA")
      .reduce((acc, m) => acc + calcularValorMovimiento(m), 0)

    const movimientosPorDiaMap = new Map<
      string,
      {
        ingreso: number
        ganancia: number
      }
    >()

    for (const mov of movimientosPeriodo) {
      const key = getFechaKey(mov.fecha)

      const actual = movimientosPorDiaMap.get(key) || {
        ingreso: 0,
        ganancia: 0,
      }

      if (mov.tipo === "ENTRADA") {
        actual.ingreso += calcularValorMovimiento(mov)
      }

      if (mov.tipo === "SALIDA") {
        actual.ganancia += calcularValorMovimiento(mov)
      }

      movimientosPorDiaMap.set(key, actual)
    }

    const ventasPorDia = Array.from(movimientosPorDiaMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, datos]) => ({
        fecha,
        ingreso: datos.ingreso,
        ganancia: datos.ganancia,
      }))

    const topMap = new Map<
      number,
      {
        id: number
        nombreProducto: string
        talla: string
        color: string
        cantidadVendida: number
        totalVendido: number
      }
    >()

    for (const mov of salidasPeriodo) {
      const id = mov.producto.id

      if (!topMap.has(id)) {
        topMap.set(id, {
          id,
          nombreProducto: mov.producto.nombreProducto,
          talla: mov.producto.codigo || "Sin código",
          color: mov.producto.unidadMedida || "Unidad",
          cantidadVendida: 0,
          totalVendido: 0,
        })
      }

      const item = topMap.get(id)!

      item.cantidadVendida += Math.abs(Number(mov.cantidad || 0))
      item.totalVendido += calcularValorMovimiento(mov)
    }

    const topProductos = Array.from(topMap.values())
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5)

    const stockCriticoList = productosStockCriticoList.slice(0, 10).map((p) => ({
      id: p.id,
      nombreProducto: p.nombreProducto,
      talla: p.codigo || "Sin código",
      color: p.ubicacion || p.unidadMedida || "Unidad",
      stock: Number(p.stock || 0),
      stockMinimo: Number(p.stockMinimo || 0),
    }))

    let totalAreas = 0

    try {
      totalAreas = await prisma.cliente.count({
        where: {
          estado: "ACTIVO",
        },
      })
    } catch {
      totalAreas = 0
    }

    const cantidadMovimientos = movimientosPeriodo.length

    const totalUnidadesSalida = salidasPeriodo.reduce(
      (acc, m) => acc + Math.abs(Number(m.cantidad || 0)),
      0
    )

    const rotacionInventario =
      totalUnidades > 0 ? totalUnidadesSalida / totalUnidades : 0

    return NextResponse.json({
      totalMateriales,
      materialesConStock,
      materialesSinStock,
      valorInventario,
      totalUnidades,

      ingresosBrutos: valorEntradas,
      gananciaBruta: valorSalidas,
      margenPromedio:
        valorEntradas > 0 ? (valorSalidas / valorEntradas) * 100 : 0,

      comparativa: {
        ventasAnterior: valorEntradasAnterior,
        porcentajeCambio: calcularPorcentajeCambio(
          valorEntradas,
          valorEntradasAnterior
        ),
        porcentajeCambioGanancia: calcularPorcentajeCambio(
          valorSalidas,
          valorSalidasAnterior
        ),
      },

      clientesActivos: totalAreas,
      clientesNuevos: 0,
      clientesFrecuentes: 0,
      ticketPromedio:
        salidasPeriodo.length > 0 ? valorSalidas / salidasPeriodo.length : 0,

      segmentacionClientes: {
        frecuentes: 0,
        ocasionales: totalAreas,
        nuevos: 0,
        total: totalAreas,
      },

      rotacionInventario,
      productosStockCritico,
      tasaAnulacion: 0,

      entradasPeriodo: entradasPeriodo.length,
      salidasPeriodo: salidasPeriodo.length,
      ajustesPeriodo: ajustesPeriodo.length,
      cantidadMovimientos,

      topProductos,
      ventasPorDia,
      stockCriticoList,
    })
  } catch (error) {
    console.error("Error al cargar dashboard de inventario:", error)

    return NextResponse.json(
      { error: "Error al cargar dashboard de inventario" },
      { status: 500 }
    )
  }
}
