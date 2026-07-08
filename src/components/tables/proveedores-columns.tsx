"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

export type ProveedorColumn = {
  id: number;
  nombreEmpresa: string;
  representante: string;
  telefono: string;
  correo: string;
};

export const columns = (
  onEdit: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<ProveedorColumn>[] => [
  {
    accessorKey: "nombreEmpresa",
    header: "Empresa",
  },
  {
    accessorKey: "representante",
    header: "Representante",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(row.original.id)}>
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(row.original.id)}>
          <Trash className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    ),
  },
];