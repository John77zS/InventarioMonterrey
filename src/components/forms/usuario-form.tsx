"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
  UsuarioCreateValues,
  UsuarioUpdateValues,
} from "@/lib/validations/usuario";

interface UsuarioFormProps {
  initialId?: number | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormValues = UsuarioCreateValues | UsuarioUpdateValues;

export const UsuarioForm = ({ initialId, onSuccess, onCancel }: UsuarioFormProps) => {
  const [loading, setLoading] = useState(false);
  const [tiposUsuario, setTiposUsuario] = useState<{ id: number; rol: string }[]>([]);

  const isEditing = !!initialId;

  useEffect(() => {
    fetch("/api/tipo-usuarios")
      .then((r) => r.json())
      .then((data) => setTiposUsuario(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? usuarioUpdateSchema : usuarioCreateSchema),
    defaultValues: {
      usuario: "",
      password: "",
      idTipoUsuario: undefined,
      estado: "ACTIVO",
    },
  });

  useEffect(() => {
    if (!initialId) return;

    fetch("/api/usuarios")
      .then((r) => r.json())
      .then((usuarios: { id: number; usuario: string; idTipoUsuario: number; estado: string }[]) => {
        const u = usuarios.find((x) => x.id === initialId);
        if (u) {
          form.reset({
            usuario: u.usuario,
            password: "",
            idTipoUsuario: u.idTipoUsuario,
            estado: u.estado as "ACTIVO" | "INACTIVO",
          });
        }
      })
      .catch(() => {});
  }, [initialId, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const url = isEditing ? `/api/usuarios/${initialId}` : "/api/usuarios";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en la operación");
      }

      toast.success(isEditing ? "Usuario actualizado con éxito" : "Usuario registrado con éxito");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error en la operación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-xl bg-card shadow-sm">
        <FormField
          control={form.control}
          name="usuario"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Nombre de Usuario</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="ej. jairo_admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                {isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
              </FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  type="password"
                  placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="idTipoUsuario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Rol de Usuario</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposUsuario.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.rol === "ADMIN" ? "Administrador" : "Vendedor"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Estado</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                  </FormControl>
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

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button disabled={loading} className="flex-1" type="submit">
            {loading
              ? isEditing ? "Guardando..." : "Registrando..."
              : isEditing ? "Guardar Cambios" : "Registrar Nuevo Usuario"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
