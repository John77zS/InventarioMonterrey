"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegistroPage() {
  const [nombre, setNombre] = useState("")
  const [usuario, setUsuario] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")

  const enviarSolicitud = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMensaje("")
    setError("")

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    try {
      setCargando(true)

      const res = await fetch("/api/solicitudes-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          usuario,
          correo,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar la solicitud")
      }

      setMensaje(
        "Solicitud enviada correctamente. Un administrador revisará tu cuenta."
      )

      setNombre("")
      setUsuario("")
      setCorreo("")
      setPassword("")
      setConfirmarPassword("")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al enviar la solicitud"
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Solicita acceso al Sistema de Inventario MKT.
          </p>
        </div>

        <form onSubmit={enviarSolicitud} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Nombre completo
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Usuario
            </label>
            <Input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej: jperez"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Correo
            </label>
            <Input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ej: correo@empresa.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          {mensaje && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="w-full bg-red-600 text-white hover:bg-red-700"
          >
            {cargando ? "Enviando solicitud..." : "Enviar solicitud"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link href="/login" className="text-red-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  )
}