"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Building2, Mail, MapPin, Phone, User } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  proveedorSchema,
  ProveedorFormValues,
} from "@/lib/validations/proveedor"

interface ProveedorFormProps {
  initialId?: number | null
  onSuccess?: () => void
}

export const ProveedorForm = ({ initialId, onSuccess }: ProveedorFormProps) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombreEmpresa: "",
      representante: "",
      telefono: "",
      correo: "",
      ubicacion: "",
    },
  })

  useEffect(() => {
    if (initialId) {
      const fetchProveedor = async () => {
        try {
          const res = await fetch(`/api/proveedores/${initialId}`)
          const data = await res.json()

          form.reset({
            nombreEmpresa: data.nombreEmpresa || "",
            representante: data.representante || "",
            telefono: data.telefono || "",
            correo: data.correo || "",
            ubicacion: data.ubicacion || "",
          })
        } catch {
          toast.error("Error al cargar proveedor")
        }
      }

      fetchProveedor()
    } else {
      form.reset({
        nombreEmpresa: "",
        representante: "",
        telefono: "",
        correo: "",
        ubicacion: "",
      })
    }
  }, [initialId, form])

  const onSubmit = async (values: ProveedorFormValues) => {
    try {
      setLoading(true)

      const url = initialId
        ? `/api/proveedores/${initialId}`
        : "/api/proveedores"

      const method = initialId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error en la operación")
      }

      toast.success(
        initialId
          ? "Proveedor actualizado correctamente"
          : "Proveedor registrado correctamente"
      )

      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error en la operación"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombreEmpresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del proveedor</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    disabled={loading}
                    placeholder="Ej: Imprenta Aliada"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="representante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Representante / Contacto</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    disabled={loading}
                    placeholder="Nombre del contacto"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      disabled={loading}
                      placeholder="Ej: 70000000"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      disabled={loading}
                      type="email"
                      placeholder="correo@empresa.com"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación / Dirección</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    disabled={loading}
                    placeholder="Ej: Santa Cruz, Bolivia"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={loading}
          className="w-full bg-red-600 text-white hover:bg-red-700"
          type="submit"
        >
          {loading
            ? "Guardando..."
            : initialId
              ? "Guardar cambios"
              : "Registrar proveedor"}
        </Button>
      </form>
    </Form>
  )
}