import { z } from "zod"

export const productoSchema = z.object({
  idCategoriaProducto: z.coerce.number().min(1, "Selecciona una categoría"),

  nombreProducto: z.string().min(1, "Ingresa el nombre del material"),
  codigo: z.string().optional().nullable(),
  unidadMedida: z.string().min(1, "Ingresa la unidad de medida").default("Unidad"),
  ubicacion: z.string().optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  observacion: z.string().optional().nullable(),
  fotoUrl: z.string().optional().nullable(),
  observacionFoto: z.string().optional().nullable(),

  marca: z.string().optional().default("Inventario MKT"),
  talla: z.string().optional().default("N/A"),
  color: z.string().optional().default("N/A"),
  temporada: z
    .enum(["PRIMAVERA", "VERANO", "OTONO", "INVIERNO", "TODO_EL_ANNO"])
    .default("TODO_EL_ANNO"),

  precioVenta: z.coerce.number().min(0).default(0),
  costo: z.coerce.number().min(0).default(0),
  stockMinimo: z.coerce.number().int().min(0).default(0),

  estado: z.enum(["ACTIVO", "INACTIVO"]).default("ACTIVO"),
})

export type ProductoFormValues = z.infer<typeof productoSchema>
