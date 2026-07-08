import { z } from "zod"

export const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apPaterno: z.string().min(1, "El apellido paterno es obligatorio"),
  apMaterno: z.string().optional().or(z.literal("")),
  telefono: z.string().min(6, "El teléfono debe tener al menos 6 dígitos"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
