"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { createProductosColumns, ProductoRow } from "@/components/tables/productos-columns"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Package, AlertTriangle, Boxes } from "lucide-react"
import ProductoForm from "@/components/forms/producto-form"
import { ProductoFormValues } from "@/lib/validations/producto"

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterStock, setFilterStock] = useState("all")

  const [createOpen, setCreateOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<ProductoRow | null>(null)

  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()
      setProductos(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar materiales")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const handleToggleEstado = useCallback(
    async (id: number, nuevoEstado: "ACTIVO" | "INACTIVO") => {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        toast.success(
          nuevoEstado === "ACTIVO"
            ? "Material activado correctamente"
            : "Material desactivado correctamente"
        )
        fetchProductos()
      } else {
        toast.error("Error al cambiar estado del material")
      }
    },
    [fetchProductos]
  )

  const handleOpenEdit = useCallback(
    (id: number) => {
      const producto = productos.find((p) => p.id === id)

      if (producto) {
        setEditingProducto(producto)
        setEditOpen(true)
      }
    },
    [productos]
  )

  const handleCrearProducto = useCallback(
    async (values: ProductoFormValues) => {
      const margen =
        values.precioVenta > 0
          ? ((values.precioVenta - values.costo) / values.precioVenta) * 100
          : 0

      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          stock: 0,
          talla: values.talla || "N/A",
          color: values.color || "N/A",
          marca: values.marca || "Inventario MKT",
          precioVenta: values.precioVenta || 0,
          costo: values.costo || 0,
          margen: parseFloat(margen.toFixed(2)),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al crear material")
        return
      }

      toast.success("Material creado correctamente")
      setCreateOpen(false)
      fetchProductos()
    },
    [fetchProductos]
  )

  const handleEditarProducto = useCallback(
    async (values: ProductoFormValues) => {
      if (!editingProducto) return

      const margen =
        values.precioVenta > 0
          ? ((values.precioVenta - values.costo) / values.precioVenta) * 100
          : 0

      const res = await fetch(`/api/productos/${editingProducto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          stock: editingProducto.stock,
          talla: values.talla || "N/A",
          color: values.color || "N/A",
          marca: values.marca || "Inventario MKT",
          precioVenta: values.precioVenta || 0,
          costo: values.costo || 0,
          margen: parseFloat(margen.toFixed(2)),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al actualizar material")
        return
      }

      toast.success("Material actualizado correctamente")
      setEditOpen(false)
      setEditingProducto(null)
      fetchProductos()
    },
    [editingProducto, fetchProductos]
  )

  const columns = useMemo(
    () => createProductosColumns(handleToggleEstado, handleOpenEdit),
    [handleToggleEstado, handleOpenEdit]
  )

  const categorias = useMemo(
    () =>
      [
        ...new Set(
          productos.map((p) => p.categoria?.nombreCategoria).filter(Boolean)
        ),
      ].sort(),
    [productos]
  )

  const totalMateriales = productos.length
  const materialesConStock = productos.filter((p) => p.stock > 0).length
  const materialesBajoStock = productos.filter(
    (p) => p.stock <= p.stockMinimo
  ).length

  const filtered = useMemo(
    () =>
      productos
        .filter(
          (p) =>
            filterCategoria === "all" ||
            p.categoria?.nombreCategoria === filterCategoria
        )
        .filter((p) => {
          if (filterStock === "all") return true
          if (filterStock === "con-stock") return p.stock > 0
          if (filterStock === "sin-stock") return p.stock <= 0
          if (filterStock === "bajo-stock") return p.stock <= p.stockMinimo
          return true
        }),
    [productos, filterCategoria, filterStock]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Inventario MKT
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Materiales de Marketing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulta, registra y controla los materiales disponibles para campañas,
            activaciones, merchandising y comunicación visual.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 text-white hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Material
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Material</DialogTitle>
            </DialogHeader>

            <p className="-mt-2 text-sm text-muted-foreground">
              El stock inicial será 0. Luego se puede actualizar desde entradas o
              movimientos de inventario.
            </p>

            <ProductoForm
              onSubmit={handleCrearProducto}
              defaultValues={{
                idCategoriaProducto: undefined as unknown as number,
                nombreProducto: "",
                marca: "Inventario MKT",
                talla: "N/A",
                color: "N/A",
                temporada: "TODO_EL_ANNO",
                precioVenta: 0,
                costo: 0,
                stockMinimo: 0,
                estado: "ACTIVO",
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total materiales</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalMateriales}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Con stock</p>
              <p className="text-2xl font-bold text-slate-900">
                {materialesConStock}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bajo stock</p>
              <p className="text-2xl font-bold text-slate-900">
                {materialesBajoStock}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c!}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado de stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el inventario</SelectItem>
            <SelectItem value="con-stock">Con stock</SelectItem>
            <SelectItem value="sin-stock">Sin stock</SelectItem>
            <SelectItem value="bajo-stock">Bajo stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando materiales...</p>
        ) : (
          <DataTable searchKey="nombreProducto" columns={columns} data={filtered} />
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingProducto(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
          </DialogHeader>

          <p className="-mt-2 text-sm text-muted-foreground">
            El stock actual es{" "}
            <strong>{editingProducto?.stock ?? 0}</strong> unidades y no se
            modifica desde este formulario.
          </p>

          {editingProducto && (
            <ProductoForm
              key={editingProducto.id}
              onSubmit={handleEditarProducto}
              defaultValues={{
                idCategoriaProducto: editingProducto.idCategoriaProducto,
                nombreProducto: editingProducto.nombreProducto,
                marca: editingProducto.marca ?? "Inventario MKT",
                talla: editingProducto.talla || "N/A",
                color: editingProducto.color || "N/A",
                temporada:
                  editingProducto.temporada as ProductoFormValues["temporada"],
                precioVenta: Number(editingProducto.precioVenta),
                costo: Number(editingProducto.costo),
                stockMinimo: editingProducto.stockMinimo,
                estado: editingProducto.estado,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}