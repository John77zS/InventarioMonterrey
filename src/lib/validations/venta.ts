import { z } from "zod"

const itemVentaSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  precio: z.number().positive("El precio debe ser mayor a 0"),
})

export const crearVentaSchema = z.object({
  idCliente: z.number().int().positive("Selecciona un cliente"),
  idTipoPago: z.number().int().positive("Selecciona un método de pago"),
  items: z.array(itemVentaSchema).min(1, "El carrito no puede estar vacío"),
})

export type CrearVentaValues = z.infer<typeof crearVentaSchema>
export type ItemVentaValues = z.infer<typeof itemVentaSchema>
