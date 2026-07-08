"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  usuario: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(1, "Ingresa tu contraseña"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)

    const result = await signIn("credentials", {
      usuario: data.usuario,
      password: data.password,
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setLoading(false)

    if (result?.error) {
      toast.error("Usuario o contraseña incorrectos")
      return
    }

    toast.success("Bienvenido al sistema")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Lado izquierdo */}
        <section className="relative hidden items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-red-900 p-12 text-white lg:flex">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_30%,white_0,transparent_18%),radial-gradient(circle_at_50%_80%,white_0,transparent_20%)]" />
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-white" />
              Sistema interno de inventario
            </div>

            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight">
              Inventario de Materiales de Marketing
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-white/85">
              Controla ingresos, salidas, stock mínimo, devoluciones y materiales promocionales desde un solo panel.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black">Stock</p>
                <p className="mt-2 text-sm text-white/75">Control actualizado</p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black">MKT</p>
                <p className="mt-2 text-sm text-white/75">Material promocional</p>
              </div>
            </div>
          </div>
        </section>

        {/* Login */}
        <section className="relative z-10 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
                <img
                  src="/logo-monterrey.svg"
                  alt="Logo Inventario Marketing"
                  className="h-full w-full object-contain" />
              <h1 className="text-3xl font-black text-slate-950">
                Inventario Marketing
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Control de materiales promocionales
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-300/40 backdrop-blur">
              <div className="mb-8">
                <img
                  src="/logo-monterrey.svg"
                  alt="Logo Inventario Marketing"
                  className="mb-6 hidden h-24 w-auto object-contain lg:block"/>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                  Bienvenido
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Ingresa con tu usuario para administrar el inventario.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Usuario
                  </label>
                  <Input
                    {...register("usuario")}
                    placeholder="admin"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                  {errors.usuario && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.usuario.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Contraseña
                  </label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-red-600 text-base font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                >
                  {loading ? "Ingresando..." : "Ingresar al sistema"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              InventarioMKT © 2026 · Control interno de materiales
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}