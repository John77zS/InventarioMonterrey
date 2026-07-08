import { z } from "zod";

export const proveedorSchema = z.object({
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  representante: z.string().min(1, "El nombre del representante es requerido"),
  telefono: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  correo: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  ubicacion: z.string().optional().or(z.literal("")),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;