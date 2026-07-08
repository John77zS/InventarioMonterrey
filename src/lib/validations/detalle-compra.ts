import { z } from "zod";

export const detalleCompraSchema = z.object({
  idCompra: z.coerce.number().int().positive("La compra es requerida"),
  idProducto: z.coerce.number().int().positive("El producto es requerido"),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  precioCompra: z.coerce.number().positive("El precio debe ser mayor a 0"),
  subtotal: z.coerce.number().positive("El subtotal debe ser mayor a 0"),
});

export type DetalleCompraFormValues = z.infer<typeof detalleCompraSchema>;