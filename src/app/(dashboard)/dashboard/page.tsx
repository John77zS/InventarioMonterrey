"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ElementType } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  Package,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TopProducto {
  id: number
  nombreProducto: string
  talla: string
  color: string
  cantidadVendida: number
  totalVendido: number
}

interface StockCritico {
  id: number
  nombreProducto: string
  talla: string
  color: string
  stock: number
  stockMinimo: number
}

interface MovimientoDia {
  fecha: string
  ingreso: number
  ganancia: number
}

interface DashboardData {
  totalMateriales?: number
  materialesConStock?: number
  materialesSinStock?: number
  valorInventario?: number
  totalUnidades?: number
  ingresosBrutos: number
  gananciaBruta: number
  margenPromedio: number
  entradasPeriodo?: number
  salidasPeriodo?: number
  ajustesPeriodo?: number
  cantidadMovimientos?: number
  clientesActivos: number
  rotacionInventario: number
  productosStockCritico: number
  tasaAnulacion: number
  topProductos: TopProducto[]
  ventasPorDia: MovimientoDia[]
  stockCriticoList: StockCritico[]
}

function fmtMoneda(valor: number) {
  return `Bs. ${Number(valor || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function fmtCorto(valor: number) {
  const n = Number(valor || 0)

  if (n >= 1000000) return `Bs. ${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `Bs. ${(n / 1000).toFixed(1)}k`

  return `Bs. ${n.toFixed(0)}`
}

function periodoTexto(periodo: string) {
  if (periodo === "dia") return "hoy"
  if (periodo === "semana") return "los últimos 7 días"
  return "los últimos 30 días"
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: ElementType
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-red-100 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-300" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {title}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState("mes")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/dashboard?periodo=${periodo}`, {
        cache: "no-store",
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Error al cargar dashboard")
      }

      setData(json)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar dashboard"
      )
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const resumen = useMemo(() => {
    return {
      totalMateriales: Number(data?.totalMateriales || 0),
      materialesConStock: Number(data?.materialesConStock || 0),
      materialesSinStock: Number(data?.materialesSinStock || 0),
      totalUnidades: Number(data?.totalUnidades || 0),
      valorInventario: Number(data?.valorInventario || 0),
      entradasPeriodo: Number(data?.entradasPeriodo || 0),
      salidasPeriodo: Number(data?.salidasPeriodo || 0),
      ajustesPeriodo: Number(data?.ajustesPeriodo || 0),
      cantidadMovimientos: Number(data?.cantidadMovimientos || 0),
    }
  }, [data])

  const movimientosPorDia = data?.ventasPorDia || []
  const topMateriales = data?.topProductos || []
  const stockCritico = data?.stockCriticoList || []

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <BarChart3 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Panel de Control
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Resumen general de materiales, stock, entradas, salidas y movimientos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/eventos"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              <CalendarDays className="h-4 w-4" />
              Eventos
            </Link>

            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="dia">Hoy</SelectItem>
                <SelectItem value="semana">Últimos 7 días</SelectItem>
                <SelectItem value="mes">Últimos 30 días</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={fetchDashboard}
              className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-red-100 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Cargando dashboard de inventario...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total materiales"
              value={String(resumen.totalMateriales)}
              subtitle={`${resumen.materialesConStock} materiales con stock disponible`}
              icon={Package}
            />

            <KpiCard
              title="Valor inventario"
              value={fmtMoneda(resumen.valorInventario)}
              subtitle="Stock actual x costo referencial"
              icon={TrendingUp}
            />

            <KpiCard
              title="Unidades disponibles"
              value={String(resumen.totalUnidades)}
              subtitle="Cantidad total en inventario"
              icon={Boxes}
            />

            <KpiCard
              title="Stock bajo"
              value={String(data?.productosStockCritico || 0)}
              subtitle={`${resumen.materialesSinStock} materiales sin stock`}
              icon={AlertTriangle}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Entradas
                  </p>

                  <p className="mt-1 text-2xl font-black text-green-600">
                    {resumen.entradasPeriodo}
                  </p>

                  <p className="text-xs text-slate-500">
                    En {periodoTexto(periodo)}
                  </p>
                </div>

                <ArrowDownToLine className="h-8 w-8 text-green-600" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Salidas
                  </p>

                  <p className="mt-1 text-2xl font-black text-red-600">
                    {resumen.salidasPeriodo}
                  </p>

                  <p className="text-xs text-slate-500">
                    Entregas registradas
                  </p>
                </div>

                <ArrowUpFromLine className="h-8 w-8 text-red-600" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ajustes
                  </p>

                  <p className="mt-1 text-2xl font-black text-yellow-600">
                    {resumen.ajustesPeriodo}
                  </p>

                  <p className="text-xs text-slate-500">
                    Ajustes manuales
                  </p>
                </div>

                <SlidersHorizontal className="h-8 w-8 text-yellow-600" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Movimientos
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {resumen.cantidadMovimientos}
                  </p>

                  <p className="text-xs text-slate-500">
                    Total del periodo
                  </p>
                </div>

                <ClipboardList className="h-8 w-8 text-slate-700" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Entradas y salidas por día
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Movimiento referencial de materiales en {periodoTexto(periodo)}.
                </p>
              </CardHeader>

              <CardContent className="h-[320px]">
                {movimientosPorDia.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No hay movimientos en este periodo.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={movimientosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis tickFormatter={fmtCorto} />
                      <Tooltip formatter={(value) => fmtMoneda(Number(value))} />

                      <Area
                        type="monotone"
                        dataKey="ingreso"
                        name="Entradas"
                        stroke="#16a34a"
                        fill="#bbf7d0"
                      />

                      <Area
                        type="monotone"
                        dataKey="ganancia"
                        name="Salidas"
                        stroke="#dc2626"
                        fill="#fecaca"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Materiales más entregados
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Top de materiales con mayor salida del inventario.
                </p>
              </CardHeader>

              <CardContent className="h-[320px]">
                {topMateriales.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Todavía no hay salidas registradas.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMateriales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombreProducto" hide />
                      <YAxis />
                      <Tooltip />

                      <Bar
                        dataKey="cantidadVendida"
                        name="Cantidad entregada"
                        fill="#dc2626"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Materiales con stock crítico
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Materiales que están igual o por debajo del stock mínimo.
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {stockCritico.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No hay materiales críticos.
                    </p>
                  ) : (
                    stockCritico.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-red-100 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.nombreProducto}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.talla} · {item.color}
                          </p>
                        </div>

                        <div className="text-right">
                          <Badge variant={item.stock === 0 ? "destructive" : "secondary"}>
                            {item.stock === 0 ? "Sin stock" : "Bajo stock"}
                          </Badge>

                          <p className="mt-1 text-xs text-slate-500">
                            Stock: {item.stock} / Mín: {item.stockMinimo}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-red-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Resumen operativo
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Indicadores generales del inventario.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Materiales registrados
                  </span>

                  <span className="font-bold">
                    {resumen.totalMateriales}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Materiales disponibles
                  </span>

                  <span className="font-bold text-green-600">
                    {resumen.materialesConStock}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Materiales sin stock
                  </span>

                  <span className="font-bold text-red-600">
                    {resumen.materialesSinStock}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Áreas solicitantes activas
                  </span>

                  <span className="font-bold">
                    {data?.clientesActivos || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Rotación de inventario
                  </span>

                  <span className="font-bold">
                    {Number(data?.rotacionInventario || 0).toFixed(2)}
                  </span>
                </div>

                <Separator />

                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  Este panel resume el estado actual del inventario de marketing:
                  stock disponible, materiales críticos, entradas, salidas y ajustes.
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}