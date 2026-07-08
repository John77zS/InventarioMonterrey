"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Building2, Plus, Truck, Users } from "lucide-react"

import { ProveedorForm } from "@/components/forms/proveedor-form"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/tables/proveedores-columns"
import { Button } from "@/components/ui/button"

type Proveedor = {
  id: number
  nombreEmpresa: string
  representante?: string | null
  telefono?: string | null
  correo?: string | null
  ubicacion?: string | null
  estado?: "ACTIVO" | "INACTIVO"
}

export default function ProveedoresPage() {
  const [data, setData] = useState<Proveedor[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProveedores = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/proveedores")
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      toast.error("Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm("Â¿Eliminar este proveedor de materiales?")) return

    try {
      const res = await fetch(`/api/proveedores/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      toast.success("Proveedor eliminado correctamente")
      fetchProveedores()
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      toast.error("Error al eliminar proveedor")
    }
  }

  useEffect(() => {
    fetchProveedores()
  }, [])

  const totalProveedores = data.length
  const proveedoresActivos = useMemo(
    () => data.filter((p) => p.estado !== "INACTIVO").length,
    [data]
  )
  const proveedoresInactivos = useMemo(
    () => data.filter((p) => p.estado === "INACTIVO").length,
    [data]
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Proveedores de Materiales
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Administra los proveedores utilizados para abastecer materiales de marketing,
                impresos, merchandising y activaciones.
              </p>
            </div>
          </div>

          {editingId && (
            <Button
              variant="outline"
              onClick={() => setEditingId(null)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo proveedor
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total proveedores</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalProveedores}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {proveedoresActivos}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Inactivos</p>
              <p className="text-2xl font-bold text-slate-500">
                {proveedoresInactivos}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Registra los datos principales del proveedor de materiales.
            </p>

            <ProveedorForm
              initialId={editingId}
              onSuccess={() => {
                fetchProveedores()
                setEditingId(null)
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Cargando proveedores...
              </p>
            ) : (
              <DataTable
                searchKey="nombreEmpresa"
                columns={columns(setEditingId, onDelete)}
                data={data}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
