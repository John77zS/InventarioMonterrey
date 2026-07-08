"use client"

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowUpFromLine, Eye, ImagePlus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AreaSolicitante {
  id: number
  nombre: string
  apPaterno: string
  apMaterno: string | null
  telefono: string
  correo: string | null
  estado: "ACTIVO" | "INACTIVO"
}

interface Producto {
  id: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  stock: number
  costo: number
}

interface ItemSalida {
  idProducto: number
  nombreProducto: string
  codigo?: string | null
  unidadMedida?: string | null
  stock: number
  costo: number
  cantidad: number
}

interface DetalleSalida {
  id: number
  cantidad: number
  precio: number
  subtotal: number
  producto: {
    id: number
    codigo?: string | null
    nombreProducto: string
    unidadMedida?: string | null
  }
}

interface SalidaRow {
  id: number
  fecha: string
  subtotal: number
  total: number
  estado: "COMPLETADA" | "ANULADA"
  cliente: AreaSolicitante
  usuario: {
    usuario: string
  }
  detalles: DetalleSalida[]
}

function formatFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(fecha))
}

function money(valor: number) {
  return `Bs. ${Number(valor || 0).toFixed(2)}`
}

export default function VentasPage() {
  const [salidas, setSalidas] = useState<SalidaRow[]>([])
  const [areas, setAreas] = useState<AreaSolicitante[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [idCliente, setIdCliente] = useState("")
  const [idProducto, setIdProducto] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState("")
  const [items, setItems] = useState<ItemSalida[]>([])

  const [fotoEvidencia, setFotoEvidencia] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState("")
  const [observacionFoto, setObservacionFoto] = useState("")
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  const [detalle, setDetalle] = useState<SalidaRow | null>(null)

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)

      const [resSalidas, resAreas, resProductos] = await Promise.all([
        fetch("/api/ventas"),
        fetch("/api/clientes"),
        fetch("/api/productos"),
      ])

      const salidasData = await resSalidas.json()
      const areasData = await resAreas.json()
      const productosData = await resProductos.json()

      setSalidas(Array.isArray(salidasData) ? salidasData : [])
      setAreas(Array.isArray(areasData) ? areasData : [])
      setProductos(Array.isArray(productosData) ? productosData : [])
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const areasActivas = useMemo(
    () => areas.filter((area) => area.estado === "ACTIVO"),
    [areas]
  )

  const productosConStock = useMemo(
    () => productos.filter((producto) => producto.stock > 0),
    [productos]
  )

  const productoSeleccionado = productos.find(
    (producto) => producto.id === Number(idProducto)
  )

  const totalReferencial = items.reduce(
    (acc, item) => acc + item.cantidad * item.costo,
    0
  )

  const totalUnidades = salidas.reduce(
    (acc, salida) =>
      acc +
      salida.detalles.reduce(
        (sum, detalle) => sum + Number(detalle.cantidad || 0),
        0
      ),
    0
  )
    const materialSeleccionadoActual = productosConStock.find(
    (producto) => String(producto.id) === idProducto
  )

  const agregarMaterial = () => {
    if (!productoSeleccionado) {
      toast.error("Selecciona un material")
      return
    }

    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0")
      return
    }

    const itemExistente = items.find(
      (item) => item.idProducto === productoSeleccionado.id
    )

    const cantidadFinal = itemExistente
      ? itemExistente.cantidad + cantidad
      : cantidad

    if (cantidadFinal > productoSeleccionado.stock) {
      toast.error(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`)
      return
    }

    if (itemExistente) {
      setItems((prev) =>
        prev.map((item) =>
          item.idProducto === productoSeleccionado.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          idProducto: productoSeleccionado.id,
          nombreProducto: productoSeleccionado.nombreProducto,
          codigo: productoSeleccionado.codigo,
          unidadMedida: productoSeleccionado.unidadMedida || "Unidad",
          stock: productoSeleccionado.stock,
          costo: Number(productoSeleccionado.costo || 0),
          cantidad,
        },
      ])
    }

    setIdProducto("")
    setCantidad(1)
  }

  const quitarMaterial = (idProducto: number) => {
    setItems((prev) => prev.filter((item) => item.idProducto !== idProducto))
  }

    const seleccionarFoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5 MB")
      return
    }

    setFotoEvidencia(file)
    setPreviewFoto(URL.createObjectURL(file))
  }

  const subirFotoEvidencia = async () => {
    if (!fotoEvidencia) return null

    const formData = new FormData()
    formData.append("file", fotoEvidencia)

    const res = await fetch("/api/upload/evidencia", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Error al subir la foto")
    }

    return data.url as string
  }

  const quitarFoto = () => {
    setFotoEvidencia(null)
    setPreviewFoto("")
    setObservacionFoto("")
  }

    const registrarSalida = async () => {
    if (!idCliente) {
      toast.error("Selecciona un área solicitante")
      return
    }

    if (motivo.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres")
      return
    }

    if (items.length === 0) {
      toast.error("Agrega al menos un material")
      return
    }

    try {
      setGuardando(true)
      setSubiendoFoto(true)

      const fotoUrl = await subirFotoEvidencia()

      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idCliente: Number(idCliente),
          motivo: motivo.trim(),
          fotoUrl,
          observacionFoto: observacionFoto.trim() || null,
          items: items.map((item) => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (Array.isArray(data.items)) {
          toast.error(data.items.join(", "))
        } else {
          toast.error(data.error || "Error al registrar salida")
        }

        return
      }

      toast.success("Salida de material registrada correctamente")

      setIdCliente("")
      setIdProducto("")
      setCantidad(1)
      setMotivo("")
      setItems([])
      setFotoEvidencia(null)
      setPreviewFoto("")
      setObservacionFoto("")

      cargarDatos()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error de conexión al registrar salida"
      )
    } finally {
      setGuardando(false)
      setSubiendoFoto(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <ArrowUpFromLine className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Inventario MKT
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Salidas de Material
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Registra entregas de materiales y descuenta stock automáticamente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-red-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Salidas registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {salidas.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Unidades entregadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUnidades}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Materiales disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productosConStock.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Registrar nueva salida
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Selecciona el área solicitante, material, cantidad y motivo.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Área solicitante</Label>
            <Select value={idCliente} onValueChange={setIdCliente}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona área" />
              </SelectTrigger>
              <SelectContent>
                {areasActivas.map((area) => (
                  <SelectItem key={area.id} value={String(area.id)}>
                    {area.nombre} - {area.apPaterno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                    <div className="min-w-0 space-y-2">
            <Label>Material</Label>

            <select
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
              className="h-10 w-full min-w-0 truncate rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Buscar material...</option>

              {productosConStock.map((producto) => (
                <option key={producto.id} value={String(producto.id)}>
                  {producto.codigo ? `${producto.codigo} - ` : ""}
                  {producto.nombreProducto} | Stock: {producto.stock}
                </option>
              ))}
            </select>

            {materialSeleccionadoActual && (
              <p className="truncate text-xs text-muted-foreground">
                {materialSeleccionadoActual.codigo || "Sin código"} · Stock disponible:{" "}
                {materialSeleccionadoActual.stock}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cantidad</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
              <Button
                type="button"
                onClick={agregarMaterial}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>Motivo de entrega</Label>
          <textarea
            className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ej: Entrega para campaña, evento, sucursal o activación..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-red-600" />
            <div>
              <Label>Evidencia fotográfica</Label>
              <p className="text-xs text-muted-foreground">
                Puedes subir una foto del material entregado o comprobante de entrega.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={seleccionarFoto}
              />

              <p className="text-xs text-muted-foreground">
                Formatos permitidos: JPG, PNG o WEBP. Máximo 5 MB.
              </p>

              {previewFoto && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={quitarFoto}
                  className="w-full"
                >
                  Quitar foto
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observación de la foto. Ej: foto tomada al momento de la entrega..."
                value={observacionFoto}
                onChange={(e) => setObservacionFoto(e.target.value)}
              />

              {previewFoto && (
                <div className="overflow-hidden rounded-lg border bg-white">
                  <img
                    src={previewFoto}
                    alt="Vista previa de evidencia"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Valor ref.</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idProducto}>
                    <TableCell>
                      <p className="font-medium">{item.nombreProducto}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.codigo || "Sin código"}
                      </p>
                    </TableCell>

                    <TableCell>{item.unidadMedida}</TableCell>

                    <TableCell className="text-right">
                      {item.cantidad}
                    </TableCell>

                    <TableCell className="text-right">
                      {money(item.cantidad * item.costo)}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => quitarMaterial(item.idProducto)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end border-t p-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Total referencial
                </p>
                <p className="text-lg font-bold">
                  {money(totalReferencial)}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={registrarSalida}
          disabled={guardando || items.length === 0}
          className="mt-5 w-full bg-red-600 text-white hover:bg-red-700"
        >
                    {guardando || subiendoFoto
            ? "Registrando salida..."
            : "Registrar salida de material"}
        </Button>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Historial de salidas
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cargando salidas...
          </p>
        ) : salidas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay salidas registradas.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Materiales</TableHead>
                  <TableHead className="text-right">Total ref.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {salidas.map((salida) => (
                  <TableRow key={salida.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatFecha(salida.fecha)}
                    </TableCell>

                    <TableCell>{salida.cliente.nombre}</TableCell>

                    <TableCell>{salida.cliente.apPaterno}</TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {salida.detalles.length} material(es)
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {money(Number(salida.total || 0))}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-green-600">
                        Registrada
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetalle(salida)}
                      >
                        <Eye className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

            <Dialog open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Salida de Material #{detalle?.id}
            </DialogTitle>
          </DialogHeader>

          {detalle && (
            <div className="space-y-3">
              <p className="break-words text-sm">
                <strong>Área:</strong> {detalle.cliente.nombre}
              </p>

              <p className="break-words text-sm">
                <strong>Responsable:</strong> {detalle.cliente.apPaterno}
              </p>

              <p className="text-sm">
                <strong>Fecha:</strong> {formatFecha(detalle.fecha)}
              </p>

              <div className="overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="w-24 text-right">
                        Cantidad
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {detalle.detalles.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal break-words text-sm">
                          {item.producto?.nombreProducto || "Material sin nombre"}
                        </TableCell>

                        <TableCell className="w-24 text-right text-sm">
                          {item.cantidad}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}