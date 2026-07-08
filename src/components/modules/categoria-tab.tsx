"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Edit, MoreHorizontal, Plus, Search, Tags } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Categoria {
  id: number
  nombreCategoria: string
  descripcion: string | null
  estado: "ACTIVO" | "INACTIVO"
}

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [search, setSearch] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias")
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar categorias")
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const filtered = useMemo(
    () =>
      categorias.filter((c) =>
        c.nombreCategoria.toLowerCase().includes(search.toLowerCase())
      ),
    [categorias, search]
  )

  const totalCategorias = categorias.length
  const categoriasActivas = categorias.filter((c) => c.estado === "ACTIVO").length
  const categoriasInactivas = categorias.filter((c) => c.estado === "INACTIVO").length

  const openNew = () => {
    setEditId(null)
    setFormData({ nombre: "", descripcion: "" })
    setShowDialog(true)
  }

  const openEdit = (cat: Categoria) => {
    setEditId(cat.id)
    setFormData({
      nombre: cat.nombreCategoria,
      descripcion: cat.descripcion ?? "",
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error("Ingresa el nombre de la categoria")
      return
    }

    const payload = {
      nombreCategoria: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
    }

    const url = editId ? `/api/categorias/${editId}` : "/api/categorias"
    const method = editId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success(
        editId
          ? "Categoria actualizada correctamente"
          : "Categoria creada correctamente"
      )
      await fetchCategorias()
      setShowDialog(false)
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Error al guardar la categoria")
    }
  }

  const handleToggleEstado = async (
    id: number,
    nuevoEstado: "ACTIVO" | "INACTIVO"
  ) => {
    const res = await fetch(`/api/categorias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    })

    if (res.ok) {
      toast.success(
        nuevoEstado === "ACTIVO"
          ? "Categoria activada correctamente"
          : "Categoria desactivada correctamente"
      )
      await fetchCategorias()
    } else {
      toast.error("Error al cambiar el estado")
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total categorias</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalCategorias}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Activas</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {categoriasActivas}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Inactivas</p>
          <p className="mt-1 text-2xl font-bold text-slate-500">
            {categoriasInactivas}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar categoria de material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button onClick={openNew} className="bg-red-600 text-white hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoria
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Categoria</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-50 p-2 text-red-600">
                        <Tags className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">
                        {cat.nombreCategoria}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {cat.descripcion ?? "Sin descripcion"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        cat.estado === "ACTIVO" ? "bg-green-600" : "bg-gray-400"
                      }
                    >
                      {cat.estado}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {cat.estado === "ACTIVO" ? (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleToggleEstado(cat.id, "INACTIVO")}
                            >
                              Desactivar categoria
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600 focus:text-green-600"
                              onClick={() => handleToggleEstado(cat.id, "ACTIVO")}
                            >
                              Activar categoria
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No se encontraron categorias de materiales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Editar Categoria de Material" : "Nueva Categoria de Material"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre de la categoria</Label>
              <Input
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: Material POP"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Input
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Ej: Material publicitario para punto de venta"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-red-600 text-white hover:bg-red-700">
              Guardar categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
