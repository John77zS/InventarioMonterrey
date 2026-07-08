"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Layers } from "lucide-react"
import { fechaLocalHoy, fechaLocalInicioMes } from "@/lib/utils"

interface RentProducto {
  id: number; nombreProducto: string; talla: string; color: string
  categoria: string; cantidadVendida: number
  ingreso: number; costo: number; ganancia: number; margen: number
}
interface RentCategoria {
  categoria: string; cantidadVendida: number
  ingreso: number; costo: number; ganancia: number; margen: number
}

function fmt(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function MargenBadge({ margen }: { margen: number }) {
  const color = margen >= 40 ? "bg-green-100 text-green-700" : margen >= 20 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
  return <Badge className={color}>{margen.toFixed(1)}%</Badge>
}

export function TabRentabilidad() {
  const [desde, setDesde] = useState(fechaLocalInicioMes())
  const [hasta, setHasta] = useState(fechaLocalHoy())
  const [productos, setProductos] = useState<RentProducto[]>([])
  const [categorias, setCategorias] = useState<RentCategoria[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReporte = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/cmi?desde=${desde}&hasta=${hasta}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProductos(data.rentabilidadProductos)
      setCategorias(data.rentabilidadCategorias)
    } catch {
      toast.error("Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  const totalProd = productos.reduce((acc, p) => ({ ingreso: acc.ingreso + p.ingreso, costo: acc.costo + p.costo, ganancia: acc.ganancia + p.ganancia }), { ingreso: 0, costo: 0, ganancia: 0 })
  const totalCat = categorias.reduce((acc, c) => ({ ingreso: acc.ingreso + c.ingreso, costo: acc.costo + c.costo, ganancia: acc.ganancia + c.ganancia }), { ingreso: 0, costo: 0, ganancia: 0 })

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
        <Button onClick={fetchReporte} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Generando..." : "Generar"}
        </Button>
      </div>

      {(productos.length > 0 || categorias.length > 0) && (
        <Tabs defaultValue="productos">
          <TabsList>
            <TabsTrigger value="productos"><Package className="h-4 w-4 mr-2" />Por Producto</TabsTrigger>
            <TabsTrigger value="categorias"><Layers className="h-4 w-4 mr-2" />Por Categoría</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Ganancia</TableHead>
                    <TableHead className="text-center">Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.nombreProducto}</div>
                        <div className="text-xs text-muted-foreground">{p.talla} · {p.color}</div>
                      </TableCell>
                      <TableCell className="text-sm">{p.categoria}</TableCell>
                      <TableCell className="text-right">{p.cantidadVendida}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(p.ingreso)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(p.costo)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(p.ganancia)}</TableCell>
                      <TableCell className="text-center"><MargenBadge margen={p.margen} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{fmt(totalProd.ingreso)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(totalProd.costo)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(totalProd.ganancia)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Ganancia</TableHead>
                    <TableHead className="text-center">Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((c) => (
                    <TableRow key={c.categoria}>
                      <TableCell className="font-medium">{c.categoria}</TableCell>
                      <TableCell className="text-right">{c.cantidadVendida}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(c.ingreso)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(c.costo)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(c.ganancia)}</TableCell>
                      <TableCell className="text-center"><MargenBadge margen={c.margen} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-bold">{fmt(totalCat.ingreso)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(totalCat.costo)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(totalCat.ganancia)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
