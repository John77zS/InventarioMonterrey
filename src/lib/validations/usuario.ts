import { z } from "zod";

export const usuarioCreateSchema = z.object({
  usuario: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  idTipoUsuario: z.number(),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

export const usuarioUpdateSchema = z.object({
  usuario: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  idTipoUsuario: z.number(),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});

export type UsuarioCreateValues = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateValues = z.infer<typeof usuarioUpdateSchema>;