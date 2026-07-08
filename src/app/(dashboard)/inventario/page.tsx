"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
  ArrowUpDown,
  Package,
  AlertTriangle,
  SlidersHorizontal,
  Check,
  ChevronsUpDown,
  Boxes,
  ClipboardList,
} from "lucide-react"

interface Movimiento {
  id: number
  fecha: string
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE"
  origen: string
  cantidad: number
  descripcion: string
  producto: {
    id: number
    codigo?: string | null
    nombreProducto: string
    unidadMedida?: string | null
    ubicacion?: string | null
    talla?: string | null
    color?: string | null
  }
  usuario: { usuario: string }
}

interface ProductoValuacion {
  id: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  ubicacion?: string | null
  stock: number
  stockMinimo: number
  costo: number
  valorReferencial: number
}

const tipoColor: Record<string, string> = {
  ENTRADA: "bg-green-600 text-white",
  SALIDA: "bg-red-600 text-white",
  AJUSTE: "bg-yellow-500 text-white",
}

const tipoLabel: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
}

function formatFecha(dateStr: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateStr))
}

function fmt(n: number) {
  return `Bs. ${Number(n || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatOrigen(origen: string) {
  const map: Record<string, string> = {
    RECEPCION_MATERIAL: "Recepción de material",
    ENTREGA_MATERIAL: "Entrega de material",
    AJUSTE_MANUAL: "Ajuste manual",
    COMPRA: "Entrada anterior",
    VENTA: "Salida anterior",
  }

  return map[origen] || origen.replace(/_/g, " ")
}

export default function InventarioPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.rol === "ADMIN"

  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [searchMov, setSearchMov] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")

  const [productos, setProductos] = useState<ProductoValuacion[]>([])
  const [searchVal, setSearchVal] = useState("")

  const [ajusteOpen, setAjusteOpen] = useState(false)
  const [ajusteProductoId, setAjusteProductoId] = useState<number | "">("")
  const [ajusteComboOpen, setAjusteComboOpen] = useState(false)
  const [ajusteCantidad, setAjusteCantidad] = useState<string>("")
  const [ajusteMotivo, setAjusteMotivo] = useState("")
  const [ajusteLoading, setAjusteLoading] = useState(false)

  const fetchMovimientos = useCallback(async () => {
    try {
      const res = await fetch("/api/inventario")
      const data = await res.json()
      setMovimientos(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar movimientos")
    }
  }, [])

  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()

      if (Array.isArray(data)) {
        setProductos(
          data.map(
            (p: {
              id: number
              codigo?: string | null
              nombreProducto: string
              unidadMedida?: string | null
              ubicacion?: string | null
              stock: number
              stockMinimo: number
              costo: number
            }) => ({
              id: p.id,
              codigo: p.codigo,
              nombreProducto: p.nombreProducto,
              unidadMedida: p.unidadMedida || "Unidad",
              ubicacion: p.ubicacion || "",
              stock: Number(p.stock || 0),
              stockMinimo: Number(p.stockMinimo || 0),
              costo: Number(p.costo || 0),
              valorReferencial: Number(p.stock || 0) * Number(p.costo || 0),
            })
          )
        )
      }
    } catch {
      toast.error("Error al cargar materiales")
    }
  }, [])

  useEffect(() => {
    fetchMovimientos()
    fetchProductos()
  }, [fetchMovimientos, fetchProductos])

  const filteredMov = useMemo(
    () =>
      movimientos.filter((m) => {
        const q = searchMov.toLowerCase()

        const matchSearch =
          m.producto.nombreProducto.toLowerCase().includes(q) ||
          String(m.producto.codigo || "").toLowerCase().includes(q) ||
          String(m.descripcion || "").toLowerCase().includes(q) ||
          String(m.origen || "").toLowerCase().includes(q) ||
          String(m.usuario.usuario || "").toLowerCase().includes(q)

        const matchTipo = filterTipo === "all" || m.tipo === filterTipo

        return matchSearch && matchTipo
      }),
    [movimientos, searchMov, filterTipo]
  )

  const filteredVal = useMemo(
    () =>
      productos.filter((p) => {
        const q = searchVal.toLowerCase()

        return (
          p.nombreProducto.toLowerCase().includes(q) ||
          String(p.codigo || "").toLowerCase().includes(q) ||
          String(p.ubicacion || "").toLowerCase().includes(q)
        )
      }),
    [productos, searchVal]
  )

  const valorTotalReferencial = useMemo(
    () => productos.reduce((acc, p) => acc + p.valorReferencial, 0),
    [productos]
  )

  const totalUnidades = useMemo(
    () => productos.reduce((acc, p) => acc + Number(p.stock || 0), 0),
    [productos]
  )

  const materialesStockCritico = useMemo(
    () => productos.filter((p) => p.stock <= p.stockMinimo && p.stock > 0).length,
    [productos]
  )

  const materialesAgotados = useMemo(
    () => productos.filter((p) => p.stock === 0).length,
    [productos]
  )

  const productoAjuste = productos.find((p) => p.id === ajusteProductoId)

  const handleAjuste = async () => {
    if (!ajusteProductoId) {
      toast.error("Selecciona un material")
      return
    }

    const cant = parseInt(ajusteCantidad)

    if (isNaN(cant) || cant === 0) {
      toast.error("La cantidad no puede ser 0")
      return
    }

    if (ajusteMotivo.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres")
      return
    }

    setAjusteLoading(true)

    try {
      const res = await fetch("/api/inventario/ajuste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idProducto: ajusteProductoId,
          cantidad: cant,
          motivo: ajusteMotivo.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al ajustar inventario")
      }

      toast.success(`Ajuste realizado. Nuevo stock: ${data.nuevoStock}`)

      setAjusteOpen(false)
      setAjusteProductoId("")
      setAjusteCantidad("")
      setAjusteMotivo("")

      fetchMovimientos()
      fetchProductos()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al realizar ajuste"
      )
    } finally {
      setAjusteLoading(false)
    }
  }

  const handleCloseAjuste = (open: boolean) => {
    setAjusteOpen(open)

    if (!open) {
      setAjusteProductoId("")
      setAjusteCantidad("")
      setAjusteMotivo("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <ArrowUpDown className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Movimientos de Inventario
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Control de entradas, salidas, ajustes y stock de materiales de marketing.
              </p>
            </div>
          </div>

          {isAdmin && (
            <Button
              onClick={() => setAjusteOpen(true)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Ajuste manual
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor referencial
            </CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold leading-tight">
              {fmt(valorTotalReferencial)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Stock x costo referencial
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unidades disponibles
            </CardTitle>
            <Boxes className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold leading-tight">
              {totalUnidades}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total de unidades en stock
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-500">
              {materialesStockCritico}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Materiales bajo mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">
              {materialesAgotados}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Materiales agotados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movimientos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movimientos">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Movimientos
          </TabsTrigger>
          <TabsTrigger value="stock">
            <ClipboardList className="mr-2 h-4 w-4" />
            Stock valorizado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos" className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por material, código, descripción o usuario..."
              value={searchMov}
              onChange={(e) => setSearchMov(e.target.value)}
              className="max-w-sm"
            />

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ENTRADA">Entradas</SelectItem>
                <SelectItem value="SALIDA">Salidas</SelectItem>
                <SelectItem value="AJUSTE">Ajustes</SelectItem>
              </SelectContent>
            </Select>
          </div>

                    <div className="overflow-x-auto rounded-xl border border-red-100 bg-white shadow-sm">
            <Table className="min-w-[1100px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Fecha</TableHead>
                  <TableHead className="w-[280px]">Material</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-44">Origen</TableHead>
                  <TableHead className="w-28 text-right">Cantidad</TableHead>
                  <TableHead className="w-[260px]">Descripción</TableHead>
                  <TableHead className="w-32">Usuario</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMov.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatFecha(m.fecha)}
                    </TableCell>

                    <TableCell className="align-top">
                      <p className="whitespace-normal break-words text-sm font-medium text-slate-900">
                        {m.producto?.nombreProducto || "Material sin nombre"}
                      </p>

                      <p className="mt-1 whitespace-normal break-words text-xs text-muted-foreground">
                        {m.producto?.codigo || "Sin código"} ·{" "}
                        {m.producto?.unidadMedida || "Unidad"}
                        {m.producto?.ubicacion
                          ? ` · ${m.producto.ubicacion}`
                          : ""}
                      </p>
                    </TableCell>

                    <TableCell className="align-top">
                      <Badge
                        className={tipoColor[m.tipo] || "bg-slate-500 text-white"}
                      >
                        {tipoLabel[m.tipo] || m.tipo}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-normal break-words align-top text-sm">
                      {formatOrigen(m.origen)}
                    </TableCell>

                    <TableCell
                      className={`whitespace-nowrap text-right align-top font-mono font-semibold ${
                        m.cantidad < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                    </TableCell>

                    <TableCell className="whitespace-normal break-words align-top text-sm text-muted-foreground">
                      {m.descripcion || "Sin descripción"}
                    </TableCell>

                    <TableCell className="whitespace-normal break-words align-top text-sm text-muted-foreground">
                      {m.usuario?.usuario || "Sin usuario"}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredMov.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-3">
          <Input
            placeholder="Buscar material, código o ubicación..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="max-w-sm"
          />

          <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Código / ubicación</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Stock mínimo</TableHead>
                  <TableHead className="text-right">Costo ref.</TableHead>
                  <TableHead className="text-right">Valor ref.</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVal.map((p) => {
                  const critico = p.stock <= p.stockMinimo && p.stock > 0
                  const agotado = p.stock === 0

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-900">
                          {p.nombreProducto}
                        </p>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        <p>{p.codigo || "Sin código"}</p>
                        <p className="text-xs">
                          {p.ubicacion || "Sin ubicación"}
                        </p>
                      </TableCell>

                      <TableCell className="text-sm">
                        {p.unidadMedida || "Unidad"}
                      </TableCell>

                      <TableCell className="text-right font-mono font-semibold">
                        {p.stock}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {p.stockMinimo}
                      </TableCell>

                      <TableCell className="text-right text-sm text-muted-foreground">
                        {fmt(p.costo)}
                      </TableCell>

                      <TableCell className="text-right text-sm font-semibold">
                        {fmt(p.valorReferencial)}
                      </TableCell>

                      <TableCell>
                        {agotado ? (
                          <Badge variant="destructive" className="text-xs">
                            Agotado
                          </Badge>
                        ) : critico ? (
                          <Badge className="bg-orange-500 text-xs text-white">
                            Bajo stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Disponible
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredVal.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No hay materiales registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-8 border-t px-2 pt-3 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Unidades totales</p>
              <p className="text-base font-bold">{totalUnidades}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Valor referencial total
              </p>
              <p className="text-base font-bold">
                {fmt(valorTotalReferencial)}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <Dialog open={ajusteOpen} onOpenChange={handleCloseAjuste}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajuste manual de material</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>
                  Material <span className="text-destructive">*</span>
                </Label>

                <Popover open={ajusteComboOpen} onOpenChange={setAjusteComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {productoAjuste ? (
                        <span className="truncate">
                          {productoAjuste.codigo
                            ? `${productoAjuste.codigo} - `
                            : ""}
                          {productoAjuste.nombreProducto}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Buscar material...
                        </span>
                      )}

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nombre o código..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron materiales.</CommandEmpty>

                        <CommandGroup>
                          {productos.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.codigo || ""} ${p.nombreProducto}`}
                              onSelect={() => {
                                setAjusteProductoId(p.id)
                                setAjusteComboOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  ajusteProductoId === p.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />

                              <span className="flex-1 truncate">
                                {p.codigo ? `${p.codigo} - ` : ""}
                                {p.nombreProducto}
                              </span>

                              <span className="ml-2 text-xs text-muted-foreground">
                                stock: {p.stock}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {productoAjuste && (
                  <p className="text-xs text-muted-foreground">
                    Stock actual:{" "}
                    <strong>
                      {productoAjuste.stock}{" "}
                      {productoAjuste.unidadMedida || "Unidad"}
                    </strong>

                    {productoAjuste.stock <= productoAjuste.stockMinimo && (
                      <span className="ml-2 font-medium text-orange-600">
                        Bajo mínimo: {productoAjuste.stockMinimo}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Cantidad <span className="text-destructive">*</span>
                </Label>

                <Input
                  type="number"
                  placeholder="Ej: +5 para añadir, -3 para reducir"
                  value={ajusteCantidad}
                  onChange={(e) => setAjusteCantidad(e.target.value)}
                />

                <p className="text-xs text-muted-foreground">
                  Usa números positivos para añadir stock y negativos para reducirlo.
                </p>

                {productoAjuste &&
                  ajusteCantidad !== "" &&
                  !isNaN(parseInt(ajusteCantidad)) && (
                    <p className="text-xs font-medium">
                      Nuevo stock:{" "}
                      <span
                        className={
                          productoAjuste.stock + parseInt(ajusteCantidad) < 0
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {productoAjuste.stock + parseInt(ajusteCantidad)}{" "}
                        {productoAjuste.unidadMedida || "Unidad"}
                      </span>
                    </p>
                  )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Motivo del ajuste <span className="text-destructive">*</span>
                </Label>

                <textarea
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ej: Corrección de conteo, material dañado, baja de stock, devolución..."
                  rows={3}
                  value={ajusteMotivo}
                  onChange={(e) => setAjusteMotivo(e.target.value)}
                  disabled={ajusteLoading}
                />

                {ajusteMotivo.length > 0 && ajusteMotivo.trim().length < 5 && (
                  <p className="text-xs text-destructive">
                    Mínimo 5 caracteres
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleCloseAjuste(false)}
                disabled={ajusteLoading}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleAjuste}
                disabled={
                  ajusteLoading ||
                  !ajusteProductoId ||
                  ajusteCantidad === "" ||
                  isNaN(parseInt(ajusteCantidad)) ||
                  parseInt(ajusteCantidad) === 0 ||
                  ajusteMotivo.trim().length < 5
                }
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {ajusteLoading ? "Aplicando..." : "Aplicar ajuste"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
