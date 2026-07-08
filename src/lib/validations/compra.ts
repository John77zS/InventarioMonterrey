import { z } from "zod"

export const itemCompraSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidad: z.number().int().min(1, "Mínimo 1 unidad"),
  precioCompra: z.number().min(0, "Debe ser mayor o igual a 0"),
})

export const compraSchema = z.object({
  idProveedor: z.number().int().positive("Selecciona un proveedor"),
  numeroDocumento: z.string().optional(),
  tipoDocumento: z.string().optional(),
  descuento: z.number().min(0).default(0),
  items: z.array(itemCompraSchema).min(1, "Agrega al menos un producto"),
})

export type ItemCompraValues = z.infer<typeof itemCompraSchema>
export type CompraFormValues = z.infer<typeof compraSchema>
