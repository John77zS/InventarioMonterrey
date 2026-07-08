"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, ChevronsUpDown, Check, PackagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Proveedor {
  id: number
  nombreEmpresa: string
}

interface Producto {
  id: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  costo: number
  stock: number
}

interface ItemEntrada {
  idProducto: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  cantidad: number
  precioCompra: number
}

interface CompraFormProps {
  proveedores: Proveedor[]
  productos: Producto[]
  onSuccess: () => void
}

export default function CompraForm({
  proveedores,
  productos,
  onSuccess,
}: CompraFormProps) {
  const [idProveedor, setIdProveedor] = useState<number | null>(null)
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("Ingreso de material")
  const [descuento, setDescuento] = useState(0)
  const [items, setItems] = useState<ItemEntrada[]>([])
  const [loading, setLoading] = useState(false)

  const [openCombo, setOpenCombo] = useState(false)
  const [productoSelId, setProductoSelId] = useState<number | "">("")
  const [cantidadSel, setCantidadSel] = useState(1)
  const [precioCostSel, setPrecioCostSel] = useState(0)

  const productoSel = productos.find((p) => p.id === productoSelId)

  const handleSelectProducto = (id: number) => {
    setProductoSelId(id)

    const prod = productos.find((p) => p.id === id)

    if (prod) {
      setPrecioCostSel(Number(prod.costo ?? 0))
    }

    setOpenCombo(false)
  }

  const handleAgregarItem = () => {
    if (!productoSelId) {
      toast.error("Selecciona un material")
      return
    }

    if (cantidadSel < 1) {
      toast.error("La cantidad debe ser mayor a 0")
      return
    }

    if (precioCostSel < 0) {
      toast.error("El costo referencial no puede ser negativo")
      return
    }

    const prod = productos.find((p) => p.id === productoSelId)

    if (!prod) return

    const yaExiste = items.find((i) => i.idProducto === productoSelId)

    if (yaExiste) {
      setItems((prev) =>
        prev.map((i) =>
          i.idProducto === productoSelId
            ? {
                ...i,
                cantidad: i.cantidad + cantidadSel,
                precioCompra: precioCostSel,
              }
            : i
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          idProducto: productoSelId as number,
          codigo: prod.codigo,
          nombreProducto: prod.nombreProducto,
          unidadMedida: prod.unidadMedida || "Unidad",
          cantidad: cantidadSel,
          precioCompra: precioCostSel,
        },
      ])
    }

    setProductoSelId("")
    setCantidadSel(1)
    setPrecioCostSel(0)
  }

  const handleRemoveItem = (idProducto: number) => {
    setItems((prev) => prev.filter((i) => i.idProducto !== idProducto))
  }

  const handleUpdateCantidad = (idProducto: number, value: number) => {
    if (value < 1) return

    setItems((prev) =>
      prev.map((i) =>
        i.idProducto === idProducto ? { ...i, cantidad: value } : i
      )
    )
  }

  const handleUpdatePrecio = (idProducto: number, value: number) => {
    if (value < 0) return

    setItems((prev) =>
      prev.map((i) =>
        i.idProducto === idProducto ? { ...i, precioCompra: value } : i
      )
    )
  }

  const subtotal = items.reduce(
    (acc, i) => acc + i.precioCompra * i.cantidad,
    0
  )

  const total = subtotal - descuento

  const handleSubmit = async () => {
    if (!idProveedor) {
      toast.error("Selecciona un proveedor")
      return
    }

    if (items.length === 0) {
      toast.error("Agrega al menos un material")
      return
    }

    if (total < 0) {
      toast.error("El ajuste no puede ser mayor al subtotal")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idProveedor,
          numeroDocumento: numeroDocumento || undefined,
          tipoDocumento: tipoDocumento || "Ingreso de material",
          descuento,
          items: items.map(({ idProducto, cantidad, precioCompra }) => ({
            idProducto,
            cantidad,
            precioCompra,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar entrada")
      }

      toast.success("Entrada de material registrada correctamente")

      setIdProveedor(null)
      setNumeroDocumento("")
      setTipoDocumento("Ingreso de material")
      setDescuento(0)
      setItems([])
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al registrar entrada de material"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>
            Proveedor <span className="text-destructive">*</span>
          </Label>

          <Select
            value={idProveedor ? String(idProveedor) : ""}
            onValueChange={(v) => setIdProveedor(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona proveedor" />
            </SelectTrigger>

            <SelectContent>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombreEmpresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Numero de documento</Label>
          <Input
            placeholder="Ej: FAC-001, REC-001"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de documento</Label>
          <Input
            placeholder="Ej: Factura, Recibo, Nota de ingreso"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-2 text-red-600">
            <PackagePlus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Materiales ingresados
            </p>
            <p className="text-xs text-muted-foreground">
              Selecciona el material, cantidad y costo referencial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Material</Label>

            <Popover open={openCombo} onOpenChange={setOpenCombo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombo}
                  className="w-full justify-between font-normal"
                >
                  {productoSel ? (
                    <span className="truncate">
                      {productoSel.codigo ? `${productoSel.codigo} - ` : ""}
                      {productoSel.nombreProducto}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Buscar material...
                    </span>
                  )}

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[420px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por codigo o nombre..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron materiales.</CommandEmpty>

                    <CommandGroup>
                      {productos.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={`${p.codigo || ""} ${p.nombreProducto}`}
                          onSelect={() => handleSelectProducto(p.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              productoSelId === p.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />

                          <div className="flex flex-1 flex-col">
                            <span className="font-medium">
                              {p.nombreProducto}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.codigo || "Sin codigo"} · Stock actual:{" "}
                              {p.stock} {p.unidadMedida || "Unidad"}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label>Costo referencial</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={precioCostSel || ""}
              onChange={(e) => setPrecioCostSel(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cantidad</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={cantidadSel}
                onChange={(e) => setCantidadSel(Number(e.target.value))}
              />

              <Button
                type="button"
                onClick={handleAgregarItem}
                size="icon"
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">
                    Material
                  </th>
                  <th className="w-28 px-4 py-2 text-right font-medium">
                    Cantidad
                  </th>
                  <th className="w-36 px-4 py-2 text-right font-medium">
                    Costo ref. Bs.
                  </th>
                  <th className="w-28 px-4 py-2 text-right font-medium">
                    Subtotal
                  </th>
                  <th className="w-10 px-2 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.idProducto} className="border-t">
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.nombreProducto}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.codigo || "Sin codigo"} ·{" "}
                        {item.unidadMedida || "Unidad"}
                      </p>
                    </td>

                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) =>
                          handleUpdateCantidad(
                            item.idProducto,
                            Number(e.target.value)
                          )
                        }
                        className="ml-auto h-8 w-20 text-right"
                      />
                    </td>

                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.precioCompra}
                        onChange={(e) =>
                          handleUpdatePrecio(
                            item.idProducto,
                            Number(e.target.value)
                          )
                        }
                        className="ml-auto h-8 w-28 text-right"
                      />
                    </td>

                    <td className="px-4 py-2 text-right font-medium">
                      Bs. {(item.precioCompra * item.cantidad).toFixed(2)}
                    </td>

                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.idProducto)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex items-center gap-8">
              <span className="text-muted-foreground">
                Subtotal referencial
              </span>
              <span className="w-28 text-right font-medium">
                Bs. {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <Label className="text-muted-foreground">
                Ajuste / descuento
              </Label>

              <Input
                type="number"
                min={0}
                max={subtotal}
                step={0.01}
                value={descuento || ""}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="h-8 w-28 text-right"
              />
            </div>

            <div className="flex items-center gap-8 border-t pt-2 text-base font-bold">
              <span>Total referencial</span>
              <span className="w-28 text-right">
                Bs. {total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading || items.length === 0 || !idProveedor}
        className="w-full bg-red-600 text-white hover:bg-red-700"
      >
        {loading ? "Registrando..." : "Registrar entrada de material"}
      </Button>
    </div>
  )
}
