"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export type UsuarioColumn = {
  id: number;
  usuario: string;
  rol: string;
  estado: string;
};

export function createUsuariosColumns(
  onEdit: (id: number) => void
): ColumnDef<UsuarioColumn>[] {
  return [
    {
      accessorKey: "usuario",
      header: "Nombre de Usuario",
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => {
        const rol = row.getValue("rol") as string;
        return (
          <Badge variant={rol === "ADMIN" ? "default" : "secondary"}>
            {rol === "ADMIN" ? "Administrador" : "Vendedor"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string;
        return (
          <Badge
            className={estado === "ACTIVO" ? "bg-green-500 hover:bg-green-600" : "bg-destructive"}
          >
            {estado}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => onEdit(row.original.id)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
