"use client"

import { type FormEvent, useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EstadoSolicitud = "PENDIENTE" | "APROBADA" | "RECHAZADA"
type RolUsuario = "ADMIN" | "OPERADOR" | "CONSULTA"
type EstadoUsuario = "ACTIVO" | "INACTIVO"
type TabConfig = "usuarios" | "solicitudes"

interface UsuarioSistema {
  id: number
  usuario: string
  estado: EstadoUsuario
  rol: string
}

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

const rolesDisponibles: { value: RolUsuario; label: string }[] = [
  {
    value: "ADMIN",
    label: "ADMIN - Acceso completo",
  },
  {
    value: "OPERADOR",
    label: "OPERADOR - Recepción y entrega",
  },
  {
    value: "CONSULTA",
    label: "CONSULTA - Stock y reportes",
  },
]

function normalizarRol(rol: string): RolUsuario {
  if (rol === "ADMIN") return "ADMIN"
  if (rol === "OPERADOR") return "OPERADOR"
  return "CONSULTA"
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<TabConfig>("usuarios")

  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])
  const [solicitudes, setSolicitudes] = useState<SolicitudUsuario[]>([])

  const [usuarioNuevo, setUsuarioNuevo] = useState("")
  const [passwordNuevo, setPasswordNuevo] = useState("")
  const [rolNuevo, setRolNuevo] = useState<RolUsuario>("CONSULTA")

  const [rolesSolicitud, setRolesSolicitud] = useState<Record<number, RolUsuario>>({})
  const [rechazos, setRechazos] = useState<Record<number, string>>({})
  const [passwords, setPasswords] = useState<Record<number, string>>({})

  const [cargandoUsuarios, setCargandoUsuarios] = useState(true)
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true)
  const [creandoUsuario, setCreandoUsuario] = useState(false)
  const [procesandoUsuarioId, setProcesandoUsuarioId] = useState<number | null>(null)
  const [procesandoSolicitudId, setProcesandoSolicitudId] = useState<number | null>(null)

  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true)

      const res = await fetch("/api/usuarios")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron cargar los usuarios")
      }

      setUsuarios(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar usuarios"
      )
    } finally {
      setCargandoUsuarios(false)
    }
  }

  const cargarSolicitudes = async () => {
    try {
      setCargandoSolicitudes(true)

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

      setRolesSolicitud(rolesIniciales)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar solicitudes"
      )
    } finally {
      setCargandoSolicitudes(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
    cargarSolicitudes()
  }, [])

  const crearUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setCreandoUsuario(true)

      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: usuarioNuevo,
          password: passwordNuevo,
          rol: rolNuevo,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear el usuario")
      }

      toast.success("Usuario creado correctamente")

      setUsuarioNuevo("")
      setPasswordNuevo("")
      setRolNuevo("CONSULTA")

      await cargarUsuarios()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear usuario"
      )
    } finally {
      setCreandoUsuario(false)
    }
  }

  const actualizarUsuario = async (
    id: number,
    cambios: {
      rol?: RolUsuario
      estado?: EstadoUsuario
      password?: string
    }
  ) => {
    try {
      setProcesandoUsuarioId(id)

      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...cambios,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar el usuario")
      }

      toast.success("Usuario actualizado")
      await cargarUsuarios()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      )
    } finally {
      setProcesandoUsuarioId(null)
    }
  }

  const aprobarSolicitud = async (id: number) => {
    try {
      setProcesandoSolicitudId(id)

      const res = await fetch("/api/solicitudes-usuario", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          accion: "APROBAR",
          rolAsignado: rolesSolicitud[id] || "CONSULTA",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo aprobar la solicitud")
      }

      toast.success("Cuenta aprobada correctamente")

      await cargarSolicitudes()
      await cargarUsuarios()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al aprobar solicitud"
      )
    } finally {
      setProcesandoSolicitudId(null)
    }
  }

  const rechazarSolicitud = async (id: number) => {
    try {
      setProcesandoSolicitudId(id)

      const res = await fetch("/api/solicitudes-usuario", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          accion: "RECHAZAR",
          motivoRechazo:
            rechazos[id] || "Solicitud rechazada por el administrador",
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
        error instanceof Error ? error.message : "Error al rechazar solicitud"
      )
    } finally {
      setProcesandoSolicitudId(null)
    }
  }

  const colorEstadoSolicitud = (estado: EstadoSolicitud) => {
    if (estado === "APROBADA") return "bg-green-100 text-green-700"
    if (estado === "RECHAZADA") return "bg-red-100 text-red-700"
    return "bg-yellow-100 text-yellow-700"
  }

  const iconoEstadoSolicitud = (estado: EstadoSolicitud) => {
    if (estado === "APROBADA") return <CheckCircle2 className="h-4 w-4" />
    if (estado === "RECHAZADA") return <XCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "PENDIENTE"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra usuarios, roles, accesos y solicitudes de cuenta.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            cargarUsuarios()
            cargarSolicitudes()
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("usuarios")}
          className={`rounded-xl border p-4 text-left shadow-sm transition ${
            tab === "usuarios"
              ? "border-red-200 bg-red-50"
              : "bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="font-semibold text-slate-900">
                Usuarios del sistema
              </h2>
              <p className="text-sm text-muted-foreground">
                Crear usuarios, cambiar roles y quitar accesos.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTab("solicitudes")}
          className={`rounded-xl border p-4 text-left shadow-sm transition ${
            tab === "solicitudes"
              ? "border-red-200 bg-red-50"
              : "bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="font-semibold text-slate-900">
                Solicitudes de cuenta
              </h2>
              <p className="text-sm text-muted-foreground">
                Pendientes: {solicitudesPendientes}
              </p>
            </div>
          </div>
        </button>
      </div>

      {tab === "usuarios" && (
        <div className="space-y-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Crear usuario manualmente
              </h2>
            </div>

            <form
              onSubmit={crearUsuario}
              className="grid gap-4 md:grid-cols-4 md:items-end"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Usuario
                </label>
                <Input
                  value={usuarioNuevo}
                  onChange={(e) => setUsuarioNuevo(e.target.value)}
                  placeholder="Ej: jperez"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={passwordNuevo}
                  onChange={(e) => setPasswordNuevo(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Rol
                </label>
                <select
                  value={rolNuevo}
                  onChange={(e) => setRolNuevo(e.target.value as RolUsuario)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={creandoUsuario}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {creandoUsuario ? "Creando..." : "Crear usuario"}
              </Button>
            </form>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Usuarios registrados
            </h2>

            {cargandoUsuarios ? (
              <p className="text-sm text-muted-foreground">
                Cargando usuarios...
              </p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay usuarios registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_180px_160px_220px]"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {usuario.usuario}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rol actual: {usuario.rol} · Estado: {usuario.estado}
                      </p>
                    </div>

                    <select
                      value={normalizarRol(usuario.rol)}
                      disabled={procesandoUsuarioId === usuario.id}
                      onChange={(e) =>
                        actualizarUsuario(usuario.id, {
                          rol: e.target.value as RolUsuario,
                        })
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {rolesDisponibles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.value}
                        </option>
                      ))}
                    </select>

                    <select
                      value={usuario.estado}
                      disabled={procesandoUsuarioId === usuario.id}
                      onChange={(e) =>
                        actualizarUsuario(usuario.id, {
                          estado: e.target.value as EstadoUsuario,
                        })
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>

                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={passwords[usuario.id] || ""}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            [usuario.id]: e.target.value,
                          }))
                        }
                        placeholder="Nueva contraseña"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        disabled={procesandoUsuarioId === usuario.id}
                        onClick={() => {
                          const password = passwords[usuario.id]

                          if (!password) {
                            toast.error("Escribe una nueva contraseña")
                            return
                          }

                          actualizarUsuario(usuario.id, { password })

                          setPasswords((prev) => ({
                            ...prev,
                            [usuario.id]: "",
                          }))
                        }}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "solicitudes" && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Solicitudes de cuenta
          </h2>

          {cargandoSolicitudes ? (
            <p className="text-sm text-muted-foreground">
              Cargando solicitudes...
            </p>
          ) : solicitudes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay solicitudes registradas.
            </p>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="rounded-xl border bg-white p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {solicitud.nombre}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${colorEstadoSolicitud(
                            solicitud.estado
                          )}`}
                        >
                          {iconoEstadoSolicitud(solicitud.estado)}
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
                            {new Date(
                              solicitud.fechaRevision
                            ).toLocaleString()}{" "}
                            por {solicitud.revisadoPor?.usuario || "Admin"}
                          </p>
                        )}

                        {solicitud.rolAsignado && (
                          <p>
                            <strong>Rol asignado:</strong>{" "}
                            {solicitud.rolAsignado}
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
                            value={rolesSolicitud[solicitud.id] || "CONSULTA"}
                            onChange={(e) =>
                              setRolesSolicitud((prev) => ({
                                ...prev,
                                [solicitud.id]: e.target.value as RolUsuario,
                              }))
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {rolesDisponibles.map((rol) => (
                              <option key={rol.value} value={rol.value}>
                                {rol.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          type="button"
                          onClick={() => aprobarSolicitud(solicitud.id)}
                          disabled={procesandoSolicitudId === solicitud.id}
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
                          disabled={procesandoSolicitudId === solicitud.id}
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
      )}
    </div>
  )
}