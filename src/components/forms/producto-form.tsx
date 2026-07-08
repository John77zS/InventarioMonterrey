"use client"

import { type ChangeEvent, useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"

import { productoSchema, ProductoFormValues } from "@/lib/validations/producto"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

interface ProductoFormProps {
  defaultValues?: Partial<ProductoFormValues> & {
    stock?: number
    margen?: number
  }
  onSubmit: SubmitHandler<ProductoFormValues>
}

export default function ProductoForm({ defaultValues, onSubmit }: ProductoFormProps) {
  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      idCategoriaProducto: undefined as unknown as number,
      codigo: "",
      nombreProducto: "",
      unidadMedida: "Unidad",
      ubicacion: "",
      fechaVencimiento: "",
      observacion: "",
      fotoUrl: "",
      observacionFoto: "",
      marca: "Inventario MKT",
      talla: "N/A",
      color: "N/A",
      temporada: "TODO_EL_ANNO",
      precioVenta: 0,
      costo: 0,
      stockMinimo: 0,
      estado: "ACTIVO",
      ...defaultValues,
    },
  })

  const [categorias, setCategorias] = useState<
    { id: number; nombreCategoria: string }[]
  >([])
  const [fotoMaterial, setFotoMaterial] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState(defaultValues?.fotoUrl || "")
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
  }, [])

    const seleccionarFotoMaterial = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5 MB")
      return
    }

    setFotoMaterial(file)
    setPreviewFoto(URL.createObjectURL(file))
  }

  const subirFotoMaterial = async () => {
    if (!fotoMaterial) {
      return form.getValues("fotoUrl") || null
    }

    const formData = new FormData()
    formData.append("file", fotoMaterial)

    const res = await fetch("/api/upload/evidencia", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Error al subir la foto")
    }

    return data.url as string
  }

  const quitarFotoMaterial = () => {
    setFotoMaterial(null)
    setPreviewFoto("")
    form.setValue("fotoUrl", "")
    form.setValue("observacionFoto", "")
  }

  const guardarMaterialConFoto: SubmitHandler<ProductoFormValues> = async (
    values
  ) => {
    try {
      setSubiendoFoto(true)

      const fotoUrl = await subirFotoMaterial()

      await onSubmit({
        ...values,
        fotoUrl: fotoUrl || "",
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la foto del material"
      )
    } finally {
      setSubiendoFoto(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(guardarMaterialConFoto)} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="idCategoriaProducto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombreCategoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <Input placeholder="Ej: MKT-IMP-001" {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="nombreProducto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del material</FormLabel>
                  <Input placeholder="Ej: Afiches promocionales" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="unidadMedida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de medida</FormLabel>
                <Input placeholder="Unidad, paquete, caja..." {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <Input placeholder="Ej: Almacén Marketing" {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fechaVencimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de vencimiento</FormLabel>
                <Input type="date" {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="costo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo unitario referencial</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockMinimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock mínimo</FormLabel>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <Input
                placeholder="Detalle adicional del material"
                {...field}
                value={field.value ?? ""}
              />
              <FormMessage />
            </FormItem>
          )}
        />
                <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-red-600" />

            <div>
              <FormLabel>Foto del material</FormLabel>
              <p className="text-xs text-muted-foreground">
                Puedes subir una imagen del material que estás añadiendo al inventario.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={seleccionarFotoMaterial}
              />

              <p className="text-xs text-muted-foreground">
                Formatos permitidos: JPG, PNG o WEBP. Máximo 5 MB.
              </p>

              {previewFoto && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={quitarFotoMaterial}
                  className="w-full"
                >
                  Quitar foto
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="observacionFoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observación de la foto</FormLabel>
                    <Input
                      placeholder="Ej: Foto frontal del material, color rojo, paquete cerrado..."
                      {...field}
                      value={field.value ?? ""}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {previewFoto && (
                <div className="overflow-hidden rounded-lg border bg-white">
                  <img
                    src={previewFoto}
                    alt="Vista previa del material"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {defaultValues?.stock !== undefined && (
          <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Stock actual:{" "}
            <strong className="text-foreground">{defaultValues.stock}</strong>
          </div>
        )}

        <Button
  type="submit"
  disabled={subiendoFoto}
  className="w-full bg-red-600 text-white hover:bg-red-700"
>
  {subiendoFoto ? "Guardando material..." : "Guardar material"}
</Button>
      </form>
    </Form>
  )
}
