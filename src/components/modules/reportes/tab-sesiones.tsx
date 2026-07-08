"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { createSesionesColumns, SesionRow } from "@/components/tables/sesiones-columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vault, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function TabSesiones({ isAdmin }: { isAdmin: boolean }) {
  const [sesiones, setSesiones] = useState<SesionRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSesiones = useCallback(async () => {
    try {
      const res = await fetch("/api/sesion-caja/historial")
      const data = await res.json()
      setSesiones(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar historial de sesiones")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSesiones()
  }, [fetchSesiones])

  const columns = useMemo(() => createSesionesColumns(isAdmin), [isAdmin])

  const stats = useMemo(() => {
    const cerradas = sesiones.filter((s) => s.estado === "CERRADA")
    const totalVendido = sesiones.reduce((acc, s) => acc + s.totalVendido, 0)
    const totalVentas = sesiones.reduce((acc, s) => acc + s.cantidadVentas, 0)
    const promDuracion =
      cerradas.length > 0
        ? Math.round(
            cerradas
              .filter((s) => s.duracionMin !== null)
              .reduce((acc, s) => acc + (s.duracionMin ?? 0), 0) / cerradas.length
          )
        : null
    return { totalVendido, totalVentas, sesionesCount: sesiones.length, promDuracion }
  }, [sesiones])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sesiones</CardTitle>
            <Vault className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sesionesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{isAdmin ? "de todos los usuarios" : "realizadas"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recaudado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {stats.totalVendido.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">en ventas completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ventas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalVentas}</div>
            <p className="text-xs text-muted-foreground mt-1">transacciones completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duración Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promDuracion !== null ? formatDuracion(stats.promDuracion) : "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">por sesión de caja</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Historial de Sesiones</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Cargando sesiones...</p>
        ) : sesiones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Vault className="h-10 w-10 opacity-30" />
            <p>No hay sesiones de caja registradas</p>
          </div>
        ) : (
          <DataTable searchKey={isAdmin ? "usuario" : "horaApertura"} columns={columns} data={sesiones} />
        )}
      </div>
    </div>
  )
}
