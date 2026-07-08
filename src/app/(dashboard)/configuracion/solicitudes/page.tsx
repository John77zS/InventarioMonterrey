"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type EstadoSolicitud = "PENDIENTE" | "APROBADA" | "RECHAZADA"
type RolUsuario = "ADMIN" | "OPERADOR" | "CONSULTA"

interface SolicitudUsuario {
  id: number
  nombre: string
  usuario: string
  correo: string | null
  estado: EstadoSolicitud
  rolAsignado: RolUsuario | null
  motivoRechazo: string | null
  fechaSolicitud: string
  fechaRevision: string | null
  revisadoPor?: {
    usuario: string
  } | null
}

export default function SolicitudesUsuarioPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudUsuario[]>([])
  const [roles, setRoles] = useState<Record<number, RolUsuario>>({})
  const [rechazos, setRechazos] = useState<Record<number, string>>({})
  const [cargando, setCargando] = useState(true)
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const cargarSolicitudes = async () => {
    try {
      setCargando(true)

      const res = await fetch("/api/solicitudes-usuario")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron cargar las solicitudes")
      }

      setSolicitudes(data)

      const rolesIniciales: Record<number, RolUsuario> = {}

      data.forEach((solicitud: SolicitudUsuario) => {
        rolesIniciales[solicitud.id] = solicitud.rolAsignado || "CONSULTA"
      })

      setRoles(rolesIniciales)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar solicitudes"
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const aprobarSolicitud = async (id: number) => {
    try {
      setProcesandoId(id)

      const res = await fetch("/api/solicitudes-usuario", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          accion: "APROBAR",
          rolAsignado: roles[id] || "CONSULTA",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo aprobar la solicitud")
      }

      toast.success("Cuenta aprobada correctamente")
      await cargarSolicitudes()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al aprobar solicitud"
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const rechazarSolicitud = async (id: number) => {
    try {
      setProcesandoId(id)

      const res = await fetch("/api/solicitudes-usuario", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          accion: "RECHAZAR",
          motivoRechazo: rechazos[id] || "Solicitud rechazada por el administrador",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo rechazar la solicitud")
      }

      toast.success("Solicitud rechazada")
      await cargarSolicitudes()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al rechazar solicitud"
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const colorEstado = (estado: EstadoSolicitud) => {
    if (estado === "APROBADA") return "bg-green-100 text-green-700"
    if (estado === "RECHAZADA") return "bg-red-100 text-red-700"
    return "bg-yellow-100 text-yellow-700"
  }

  const iconoEstado = (estado: EstadoSolicitud) => {
    if (estado === "APROBADA") return <CheckCircle2 className="h-4 w-4" />
    if (estado === "RECHAZADA") return <XCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra las solicitudes de cuenta, roles y accesos del sistema.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={cargarSolicitudes}
          disabled={cargando}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {cargando ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
          Cargando solicitudes...
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
          No hay solicitudes registradas.
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {solicitud.nombre}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${colorEstado(
                        solicitud.estado
                      )}`}
                    >
                      {iconoEstado(solicitud.estado)}
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Usuario:</strong> {solicitud.usuario}
                    </p>
                    <p>
                      <strong>Correo:</strong>{" "}
                      {solicitud.correo || "Sin correo"}
                    </p>
                    <p>
                      <strong>Fecha de solicitud:</strong>{" "}
                      {new Date(solicitud.fechaSolicitud).toLocaleString()}
                    </p>

                    {solicitud.fechaRevision && (
                      <p>
                        <strong>Revisado:</strong>{" "}
                        {new Date(solicitud.fechaRevision).toLocaleString()} por{" "}
                        {solicitud.revisadoPor?.usuario || "Administrador"}
                      </p>
                    )}

                    {solicitud.rolAsignado && (
                      <p>
                        <strong>Rol asignado:</strong> {solicitud.rolAsignado}
                      </p>
                    )}

                    {solicitud.motivoRechazo && (
                      <p>
                        <strong>Motivo rechazo:</strong>{" "}
                        {solicitud.motivoRechazo}
                      </p>
                    )}
                  </div>
                </div>

                {solicitud.estado === "PENDIENTE" && (
                  <div className="w-full space-y-3 md:w-80">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">
                        Rol a asignar
                      </label>

                      <select
                        value={roles[solicitud.id] || "CONSULTA"}
                        onChange={(e) =>
                          setRoles((prev) => ({
                            ...prev,
                            [solicitud.id]: e.target.value as RolUsuario,
                          }))
                        }
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="CONSULTA">
                          CONSULTA - Ver stock y reportes
                        </option>
                        <option value="OPERADOR">
                          OPERADOR - Recepción y entrega
                        </option>
                        <option value="ADMIN">
                          ADMIN - Acceso completo
                        </option>
                      </select>
                    </div>

                    <Button
                      type="button"
                      onClick={() => aprobarSolicitud(solicitud.id)}
                      disabled={procesandoId === solicitud.id}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      Aprobar y crear cuenta
                    </Button>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">
                        Motivo de rechazo
                      </label>

                      <textarea
                        value={rechazos[solicitud.id] || ""}
                        onChange={(e) =>
                          setRechazos((prev) => ({
                            ...prev,
                            [solicitud.id]: e.target.value,
                          }))
                        }
                        placeholder="Opcional"
                        className="min-h-[70px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rechazarSolicitud(solicitud.id)}
                      disabled={procesandoId === solicitud.id}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Rechazar solicitud
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}