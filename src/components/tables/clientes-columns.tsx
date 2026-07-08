"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  Building2,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ClienteRow {
  id: number
  nombre: string
  apPaterno: string
  apMaterno: string | null
  telefono: string
  correo: string | null
  estado: "ACTIVO" | "INACTIVO"
}

export const createClientesColumns = (
  onEdit: (id: number) => void,
  onToggleEstado: (id: number, estado: "ACTIVO" | "INACTIVO") => void
): ColumnDef<ClienteRow>[] => [
  {
    id: "nombreCompleto",
    header: "Área solicitante",
    accessorFn: (row) =>
      `${row.nombre} ${row.apPaterno} ${row.apMaterno ?? ""} ${row.telefono} ${row.correo ?? ""}`.trim(),
    cell: ({ row }) => {
      const area = row.original.nombre
      const responsable = row.original.apPaterno
      const referencia = row.original.apMaterno

      return (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600">
            <Building2 className="h-4 w-4" />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {area}
            </p>

            <p className="text-xs text-muted-foreground">
              {referencia || "Sin referencia adicional"}
            </p>

            <p className="text-xs text-slate-500">
              Responsable: {responsable}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    header: "Responsable",
    accessorKey: "apPaterno",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <UserRound className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.apPaterno}</span>
      </div>
    ),
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.telefono}</span>
      </div>
    ),
  },
  {
    header: "Correo",
    accessorKey: "correo",
    cell: ({ row }) =>
      row.original.correo ? (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.correo}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Sin correo</span>
      ),
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => (
      <Badge
        className={
          row.original.estado === "ACTIVO"
            ? "bg-green-600"
            : "bg-gray-400"
        }
      >
        {row.original.estado === "ACTIVO" ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => {
      const { id, estado } = row.original

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
            title="Editar área solicitante"
          >
            <Edit className="h-4 w-4 text-red-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {estado === "ACTIVO" ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onToggleEstado(id, "INACTIVO")}
                >
                  Desactivar área
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-green-600 focus:text-green-600"
                  onClick={() => onToggleEstado(id, "ACTIVO")}
                >
                  Activar área
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
