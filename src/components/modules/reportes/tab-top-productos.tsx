"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Trophy, ShoppingBag, TrendingUp } from "lucide-react"
import { fechaLocalHoy, fechaLocalInicioMes } from "@/lib/utils"

interface CategoriaOption { id: number; nombreCategoria: string }
interface TopProducto {
  posicion: number; id: number; nombreProducto: string; talla: string; color: string
  marca: string | null; categoria: string; cantidadVendida: number
  totalVendido: number; costoTotal: number; ganancia: number; margenPorcentaje: number
}

function fmt(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TabTopProductos() {
  const [desde, setDesde] = useState(fechaLocalInicioMes())
  const [hasta, setHasta] = useState(fechaLocalHoy())
  const [categoria, setCategoria] = useState("all")
  const [categorias, setCategorias] = useState<CategoriaOption[]>([])
  const [data, setData] = useState<TopProducto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadCategorias() {
      try {
        const res = await fetch("/api/categorias")
        const all: CategoriaOption[] = await res.json()
        setCategorias(all.filter((c: CategoriaOption & { estado?: string }) => !c.estado || c.estado === "ACTIVO"))
      } catch { /* ignore */ }
    }
    loadCategorias()
  }, [])

  const fetchReporte = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ desde, hasta, limit: "20" })
      if (categoria !== "all") params.set("categoria", categoria)
      const res = await fetch(`/api/reportes/top-productos?${params}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }, [desde, hasta, categoria])

  const totales = data.reduce(
    (acc, p) => ({
      cantidad: acc.cantidad + p.cantidadVendida,
      vendido: acc.vendido + p.totalVendido,
      ganancia: acc.ganancia + p.ganancia,
    }),
    { cantidad: 0, vendido: 0, ganancia: 0 }
  )

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
          <label className="text-xs text-muted-foreground">Categoría</label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombreCategoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchReporte} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Generando..." : "Generar"}
        </Button>
      </div>

      {data.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unidades Vendidas</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{totales.cantidad}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{fmt(totales.vendido)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia Total</CardTitle>
                <Trophy className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{fmt(totales.ganancia)}</div></CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.posicion <= 3 ? (
                        <Badge variant="outline" className={p.posicion === 1 ? "border-amber-400 text-amber-600" : p.posicion === 2 ? "border-gray-400 text-gray-500" : "border-orange-400 text-orange-600"}>
                          {p.posicion}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{p.posicion}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{p.nombreProducto}</div>
                      <div className="text-xs text-muted-foreground">{p.talla} · {p.color}</div>
                    </TableCell>
                    <TableCell className="text-sm">{p.categoria}</TableCell>
                    <TableCell className="text-right">{p.cantidadVendida}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.totalVendido)}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.ganancia)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-medium ${p.margenPorcentaje >= 40 ? "text-green-600" : p.margenPorcentaje >= 20 ? "text-amber-600" : "text-red-600"}`}>
                        {p.margenPorcentaje.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{totales.cantidad}</TableCell>
                  <TableCell className="text-right font-bold">{fmt(totales.vendido)}</TableCell>
                  <TableCell className="text-right font-bold">{fmt(totales.ganancia)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
