"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { ClienteForm } from "@/components/forms/cliente-form"
import {
  createClientesColumns,
  ClienteRow,
} from "@/components/tables/clientes-columns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building2,
  Mail,
  Phone,
  Plus,
  UserCheck,
  Users,
} from "lucide-react"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/clientes")
      const data = await res.json()

      setClientes(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar áreas solicitantes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const handleToggleEstado = useCallback(
    async (id: number, estado: "ACTIVO" | "INACTIVO") => {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
      })

      if (res.ok) {
        toast.success(
          estado === "ACTIVO"
            ? "Área solicitante activada"
            : "Área solicitante desactivada"
        )

        fetchClientes()
      } else {
        toast.error("Error al cambiar estado del área solicitante")
      }
    },
    [fetchClientes]
  )

  const handleOpenEdit = useCallback((id: number) => {
    setEditingId(id)
    setEditOpen(true)
  }, [])

  const columns = useMemo(
    () => createClientesColumns(handleOpenEdit, handleToggleEstado),
    [handleOpenEdit, handleToggleEstado]
  )

  const stats = useMemo(() => {
    const total = clientes.length

    const activos = clientes.filter(
      (c) => (c as { estado?: string }).estado === "ACTIVO"
    ).length

    const inactivos = clientes.filter(
      (c) => (c as { estado?: string }).estado === "INACTIVO"
    ).length

    const conCorreo = clientes.filter(
      (c) => Boolean((c as { correo?: string | null }).correo)
    ).length

    const conTelefono = clientes.filter(
      (c) => Boolean((c as { telefono?: string | null }).telefono)
    ).length

    return {
      total,
      activos,
      inactivos,
      conCorreo,
      conTelefono,
    }
  }, [clientes])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Áreas Solicitantes
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Registra las áreas, departamentos o responsables que solicitan materiales de marketing.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva área
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total áreas
            </CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Registradas en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activas
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activos}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pueden solicitar materiales
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactivas
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {stats.inactivos}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Deshabilitadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con correo
            </CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stats.conCorreo}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Contacto por email
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con teléfono
            </CardTitle>
            <Phone className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stats.conTelefono}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Contacto telefónico
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Directorio de áreas solicitantes
          </h2>

          <p className="text-sm text-slate-500">
            {loading
              ? "Cargando registros..."
              : `${clientes.length} áreas solicitantes registradas`}
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cargando áreas solicitantes...
          </p>
        ) : (
          <DataTable
            searchKey="nombreCompleto"
            columns={columns}
            data={clientes}
          />
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva área solicitante</DialogTitle>
          </DialogHeader>

          <ClienteForm
            onSuccess={() => {
              setCreateOpen(false)
              fetchClientes()
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)

          if (!open) {
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar área solicitante</DialogTitle>
          </DialogHeader>

          <ClienteForm
            key={editingId}
            initialId={editingId}
            onSuccess={() => {
              setEditOpen(false)
              setEditingId(null)
              fetchClientes()
            }}
            onCancel={() => {
              setEditOpen(false)
              setEditingId(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
