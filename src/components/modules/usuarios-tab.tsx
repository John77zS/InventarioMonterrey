"use client";

import { useEffect, useMemo, useState } from "react";
import { UsuarioForm } from "@/components/forms/usuario-form";
import { DataTable } from "@/components/ui/data-table";
import { createUsuariosColumns, UsuarioColumn } from "@/components/tables/usuarios-columns";

interface UsuarioRaw {
  id: number
  usuario: string
  tipoUsuario?: { rol: string }
  estado: string
}

export const UsuariosTab = () => {
  const [data, setData] = useState<UsuarioColumn[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios");
      const usuarios = await res.json();

      const formatted = usuarios.map((u: UsuarioRaw) => ({
        id: u.id,
        usuario: u.usuario,
        rol: u.tipoUsuario?.rol || "N/A",
        estado: u.estado,
      }));
      setData(formatted);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const columns = useMemo(
    () => createUsuariosColumns((id) => setEditingId(id)),
    []
  );

  const handleSuccess = () => {
    fetchUsuarios();
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-medium">
            {editingId ? "Editar Usuario" : "Nuevo Usuario"}
          </h3>
          <UsuarioForm
            key={editingId ?? "nuevo"}
            initialId={editingId}
            onSuccess={handleSuccess}
            onCancel={editingId ? () => setEditingId(null) : undefined}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-medium">Usuarios Registrados</h3>
          <DataTable searchKey="usuario" columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
};
