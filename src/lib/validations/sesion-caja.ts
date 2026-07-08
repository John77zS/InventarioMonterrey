import { z } from "zod"

export const abrirCajaSchema = z.object({
  montoInicial: z
    .number({ error: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
})

export type AbrirCajaValues = z.infer<typeof abrirCajaSchema>
