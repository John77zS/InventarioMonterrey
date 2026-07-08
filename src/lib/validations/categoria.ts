import { z } from 'zod';

export const categoriaSchema = z.object({
  nombreCategoria: z.string().min(1, 'El nombre de la categoría es requerido'),
  descripcion: z.string().optional().or(z.literal('')),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;