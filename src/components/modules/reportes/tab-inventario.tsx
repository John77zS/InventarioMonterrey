"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react"

interface ProductoValuacion {
  id: number; nombreProducto: string; talla: string; color: string; marca: string | null
  stock: number; stockMinimo: number; costo: number; precioVenta: number
  valorCosto: number; valorVenta: number
}

function fmt(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TabInventario() {
  const [productos, setProductos] = useState<ProductoValuacion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")

  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()
      const mapped = (Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
        id: p.id as number,
        nombreProducto: p.nombreProducto as string,
        talla: p.talla as string,
        color: p.color as string,
        marca: p.marca as string | null,
        stock: p.stock as number,
        stockMinimo: p.stockMinimo as number,
        costo: Number(p.costo),
        precioVenta: Number(p.precioVenta),
        valorCosto: (p.stock as number) * Number(p.costo),
        valorVenta: (p.stock as number) * Number(p.precioVenta),
      }))
      setProductos(mapped)
    } catch {
      toast.error("Error al cargar inventario")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const filtered = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch = p.nombreProducto.toLowerCase().includes(search.toLowerCase())
      if (filterEstado === "critico") return matchSearch && p.stock > 0 && p.stock <= p.stockMinimo
      if (filterEstado === "agotado") return matchSearch && p.stock === 0
      if (filterEstado === "ok") return matchSearch && p.stock > p.stockMinimo
      return matchSearch
    })
  }, [productos, search, filterEstado])

  const stats = useMemo(() => ({
    valorCosto: productos.reduce((acc, p) => acc + p.valorCosto, 0),
    valorVenta: productos.reduce((acc, p) => acc + p.valorVenta, 0),
    criticos: productos.filter((p) => p.stock > 0 && p.stock <= p.stockMinimo).length,
    agotados: productos.filter((p) => p.stock === 0).length,
  }), [productos])

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Cargando inventario...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor al Costo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(stats.valorCosto)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor de Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{fmt(stats.valorVenta)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{stats.criticos}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agotados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.agotados}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
            <SelectItem value="agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Mín.</TableHead>
              <TableHead className="text-right">Costo Unit.</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead className="text-right">Valor Costo</TableHead>
              <TableHead className="text-right">Valor Venta</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No hay productos que coincidan
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const estado = p.stock === 0 ? "Agotado" : p.stock <= p.stockMinimo ? "Crítico" : "OK"
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{p.nombreProducto}</div>
                      <div className="text-xs text-muted-foreground">{p.talla} · {p.color}</div>
                    </TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.stockMinimo}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.costo)}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.precioVenta)}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.valorCosto)}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(p.valorVenta)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={estado === "Agotado" ? "destructive" : estado === "Crítico" ? "outline" : "default"} className={estado === "Crítico" ? "border-amber-500 text-amber-600" : estado === "OK" ? "bg-green-100 text-green-700" : ""}>
                        {estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
          {filtered.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{fmt(filtered.reduce((a, p) => a + p.valorCosto, 0))}</TableCell>
                <TableCell className="text-right font-bold">{fmt(filtered.reduce((a, p) => a + p.valorVenta, 0))}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}
