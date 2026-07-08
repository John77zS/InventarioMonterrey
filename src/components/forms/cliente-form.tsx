"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { clienteSchema, ClienteFormValues } from "@/lib/validations/cliente"

interface ClienteFormProps {
  initialId?: number | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClienteForm({
  initialId,
  onSuccess,
  onCancel,
}: ClienteFormProps) {
  const isEditing = !!initialId

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      apPaterno: "",
      apMaterno: "",
      telefono: "",
      correo: "",
    },
  })

  useEffect(() => {
    if (!initialId) {
      form.reset({
        nombre: "",
        apPaterno: "",
        apMaterno: "",
        telefono: "",
        correo: "",
      })

      return
    }

    fetch(`/api/clientes/${initialId}`)
      .then((r) => r.json())
      .then((data) => {
        form.reset({
          nombre: data.nombre ?? "",
          apPaterno: data.apPaterno ?? "",
          apMaterno: data.apMaterno ?? "",
          telefono: data.telefono ?? "",
          correo: data.correo ?? "",
        })
      })
      .catch(() =>
        toast.error("Error al cargar los datos del área solicitante")
      )
  }, [initialId, form])

  const onSubmit = async (values: ClienteFormValues) => {
    const url = isEditing ? `/api/clientes/${initialId}` : "/api/clientes"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error ?? "Error en la operación")
      return
    }

    toast.success(
      isEditing
        ? "Área solicitante actualizada correctamente"
        : "Área solicitante registrada correctamente"
    )

    form.reset({
      nombre: "",
      apPaterno: "",
      apMaterno: "",
      telefono: "",
      correo: "",
    })

    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área / Departamento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Marketing, Ventas, Sucursal Norte"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="apPaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apMaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cargo / Referencia{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Encargado de área" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 70123456" {...field} />
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
                <FormLabel>
                  Correo{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="area@empresa.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? isEditing
                ? "Guardando..."
                : "Registrando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar área"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
