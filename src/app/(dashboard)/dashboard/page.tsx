"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
} from "lucide-react";
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
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TopProducto {
  id: number;
  nombreProducto: string;
  talla: string;
  color: string;
  cantidadVendida: number;
  totalVendido: number;
}

interface StockCritico {
  id: number;
  nombreProducto: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
}

interface MovimientoDia {
  fecha: string;
  ingreso: number;
  ganancia: number;
}

interface DashboardData {
  totalMateriales?: number;
  materialesConStock?: number;
  materialesSinStock?: number;
  valorInventario?: number;
  totalUnidades?: number;
  ingresosBrutos: number;
  gananciaBruta: number;
  margenPromedio: number;
  entradasPeriodo?: number;
  salidasPeriodo?: number;
  ajustesPeriodo?: number;
  cantidadMovimientos?: number;
  clientesActivos: number;
  rotacionInventario: number;
  productosStockCritico: number;
  tasaAnulacion: number;
  topProductos: TopProducto[];
  ventasPorDia: MovimientoDia[];
  stockCriticoList: StockCritico[];
}

function fmtMoneda(valor: number) {
  return `Bs. ${Number(valor || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtCorto(valor: number) {
  const n = Number(valor || 0);

  if (n >= 1000000) return `Bs. ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `Bs. ${(n / 1000).toFixed(1)}k`;

  return `Bs. ${n.toFixed(0)}`;
}

function periodoTexto(periodo: string) {
  if (periodo === "dia") return "hoy";
  if (periodo === "semana") return "los últimos 7 días";
  return "los últimos 30 días";
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
}) {
  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border-red-100 bg-white shadow-sm sm:rounded-2xl">
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-300" />

      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs sm:tracking-[0.16em]">
              {title}
            </p>

            <p className="mt-1 break-words text-xl font-black leading-tight text-slate-950 sm:mt-2 sm:text-2xl">
              {value}
            </p>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
              {subtitle}
            </p>
          </div>

          <div className="hidden rounded-xl bg-red-50 p-3 text-red-600 sm:block">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState("mes");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/dashboard?periodo=${periodo}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al cargar dashboard");
      }

      setData(json);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    };
  }, [data]);

  const movimientosPorDia = data?.ventasPorDia || [];
  const topMateriales = data?.topProductos || [];
  const stockCritico = data?.stockCriticoList || [];

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="rounded-xl border border-red-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-2.5 sm:items-center sm:gap-3">
            <div className="rounded-lg bg-red-50 p-2 text-red-600 sm:rounded-xl sm:p-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 sm:text-sm">
                Inventario MKT
              </p>

              <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                Panel de Control
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Resumen general de materiales, stock, entradas, salidas y
                movimientos.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/eventos"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <CalendarDays className="h-4 w-4" />
              Eventos
            </Link>

            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="order-3 col-span-2 h-9 w-full text-xs sm:order-none sm:h-10 sm:w-[180px] sm:text-sm">
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
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-slate-50 sm:h-10 sm:gap-2 sm:text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-red-100 bg-white p-6 text-center text-sm text-slate-500 shadow-sm sm:rounded-2xl sm:p-10">
          Cargando dashboard de inventario...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Entradas
                  </p>

                  <p className="mt-1 text-xl font-black text-green-600 sm:text-2xl">
                    {resumen.entradasPeriodo}
                  </p>

                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    En {periodoTexto(periodo)}
                  </p>
                </div>

                <ArrowDownToLine className="hidden h-8 w-8 text-green-600 sm:block" />
              </CardContent>
            </Card>

            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Salidas
                  </p>

                  <p className="mt-1 text-xl font-black text-red-600 sm:text-2xl">
                    {resumen.salidasPeriodo}
                  </p>

                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    Entregas registradas
                  </p>
                </div>

                <ArrowUpFromLine className="hidden h-8 w-8 text-red-600 sm:block" />
              </CardContent>
            </Card>

            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Ajustes
                  </p>

                  <p className="mt-1 text-xl font-black text-yellow-600 sm:text-2xl">
                    {resumen.ajustesPeriodo}
                  </p>

                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    Ajustes manuales
                  </p>
                </div>

                <SlidersHorizontal className="hidden h-8 w-8 text-yellow-600 sm:block" />
              </CardContent>
            </Card>

            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Movimientos
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                    {resumen.cantidadMovimientos}
                  </p>

                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
                    Total del periodo
                  </p>
                </div>

                <ClipboardList className="hidden h-8 w-8 text-slate-700 sm:block" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  Entradas y salidas por día
                </CardTitle>

                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  Movimiento referencial de materiales en{" "}
                  {periodoTexto(periodo)}.
                </p>
              </CardHeader>

              <CardContent className="h-[230px] p-2 pt-0 sm:h-[320px] sm:p-6 sm:pt-0">
                {movimientosPorDia.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No hay movimientos en este periodo.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={movimientosPorDia}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={fmtCorto} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value) => fmtMoneda(Number(value))}
                      />

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

            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  Materiales más entregados
                </CardTitle>

                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  Top de materiales con mayor salida del inventario.
                </p>
              </CardHeader>

              <CardContent className="h-[230px] p-2 pt-0 sm:h-[320px] sm:p-6 sm:pt-0">
                {topMateriales.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Todavía no hay salidas registradas.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topMateriales}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombreProducto" hide />
                      <YAxis tick={{ fontSize: 10 }} />
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

          <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  Materiales con stock crítico
                </CardTitle>

                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  Materiales que están igual o por debajo del stock mínimo.
                </p>
              </CardHeader>

              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-3">
                  {stockCritico.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No hay materiales críticos.
                    </p>
                  ) : (
                    stockCritico.map((item) => (
                      <div
                        key={item.id}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-red-100 p-2.5 sm:rounded-xl sm:p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                            {item.nombreProducto}
                          </p>

                          <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                            {item.talla} · {item.color}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <Badge
                            variant={
                              item.stock === 0 ? "destructive" : "secondary"
                            }
                          >
                            {item.stock === 0 ? "Sin stock" : "Bajo stock"}
                          </Badge>

                          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                            Stock: {item.stock} / Mín: {item.stockMinimo}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-red-100 shadow-sm sm:rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">
                  Resumen operativo
                </CardTitle>

                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  Indicadores generales del inventario.
                </p>
              </CardHeader>

              <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    Materiales registrados
                  </span>

                  <span className="font-bold">{resumen.totalMateriales}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    Materiales disponibles
                  </span>

                  <span className="font-bold text-green-600">
                    {resumen.materialesConStock}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    Materiales sin stock
                  </span>

                  <span className="font-bold text-red-600">
                    {resumen.materialesSinStock}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    Áreas solicitantes activas
                  </span>

                  <span className="font-bold">
                    {data?.clientesActivos || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 sm:text-sm">
                    Rotación de inventario
                  </span>

                  <span className="font-bold">
                    {Number(data?.rotacionInventario || 0).toFixed(2)}
                  </span>
                </div>

                <Separator />

                <div className="rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700 sm:rounded-xl sm:p-4 sm:text-sm">
                  Este panel resume el estado actual del inventario de
                  marketing: stock disponible, materiales críticos, entradas,
                  salidas y ajustes.
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}