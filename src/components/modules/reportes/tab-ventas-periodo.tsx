"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { createVentasColumns, VentaRow } from "@/components/tables/ventas-columns"
import { Receipt, ShoppingBag, TrendingUp, CreditCard, Search } from "lucide-react"
import { fechaLocalHoy, fechaLocalInicioMes } from "@/lib/utils"

interface VentaPorDia { fecha: string; total: number; cantidad: number }
interface VentaPorTipoPago { metodo: string; cantidad: number; total: number }
interface ReporteData {
  ventas: VentaRow[]
  resumen: {
    totalVentas: number; cantidadVentas: number; ticketPromedio: number
    ventasPorTipoPago: VentaPorTipoPago[]; ventasPorDia: VentaPorDia[]
  }
}

function fmt(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TabVentasPeriodo() {
  const [desde, setDesde] = useState(fechaLocalInicioMes())
  const [hasta, setHasta] = useState(fechaLocalHoy())
  const [tipoPago, setTipoPago] = useState("all")
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReporte = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ desde, hasta })
      if (tipoPago !== "all") params.set("tipoPago", tipoPago)
      const res = await fetch(`/api/reportes/ventas?${params}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }, [desde, hasta, tipoPago])

  const columns = useMemo(() => createVentasColumns(), [])

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="text-xs text-muted-foreground">Desde</label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Hasta</label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tipo de Pago</label>
          <Select value={tipoPago} onValueChange={setTipoPago}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="1">Efectivo</SelectItem>
              <SelectItem value="2">Tarjeta</SelectItem>
              <SelectItem value="3">QR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchReporte} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(data.resumen.totalVentas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cantidad</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.resumen.cantidadVentas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(data.resumen.ticketPromedio)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Tipo de Pago</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {data.resumen.ventasPorTipoPago.map((tp) => (
                    <div key={tp.metodo} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tp.metodo}</span>
                      <span className="font-medium">{tp.cantidad}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {data.resumen.ventasPorDia.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Resumen por Día</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.resumen.ventasPorDia.map((d) => (
                      <TableRow key={d.fecha}>
                        <TableCell className="text-sm">{d.fecha}</TableCell>
                        <TableCell className="text-right">{d.cantidad}</TableCell>
                        <TableCell className="text-right text-sm">{fmt(d.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{data.resumen.cantidadVentas}</TableCell>
                      <TableCell className="text-right font-bold">{fmt(data.resumen.totalVentas)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Detalle de Ventas</h3>
            <DataTable searchKey="cliente" columns={columns} data={data.ventas} />
          </div>
        </>
      )}
    </div>
  )
}
