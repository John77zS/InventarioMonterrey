"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Ban, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface DetalleVentaRow {
  id: number
  cantidad: number
  precio: number
  subtotal: number
  producto: {
    id: number
    nombreProducto: string
    talla: string
    color: string
  }
}

export interface VentaRow {
  id: number
  fecha: string
  estado: "COMPLETADA" | "ANULADA"
  subtotal: number
  total: number
  motivoAnulacion: string | null
  cliente: {
    id: number
    nombre: string
    apPaterno: string
    apMaterno: string | null
  }
  usuario: { id: number; usuario: string }
  tipoPago: { id: number; tipoMetodo: string }
  detalles: DetalleVentaRow[]
}

function formatFecha(dateStr: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateStr))
}

export const createVentasColumns = (
  onVerDetalle?: (venta: VentaRow) => void,
  onAnular?: (venta: VentaRow) => void
): ColumnDef<VentaRow>[] => [
  {
    header: "#",
    accessorKey: "id",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
    ),
  },
  {
    header: "Fecha",
    accessorKey: "fecha",
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap">{formatFecha(row.original.fecha)}</span>
    ),
  },
  {
    id: "cliente",
    header: "Cliente",
    accessorFn: (row) =>
      `${row.cliente.apPaterno} ${row.cliente.apMaterno ?? ""} ${row.cliente.nombre}`.trim(),
    cell: ({ row }) => {
      const c = row.original.cliente
      return (
        <span className="text-sm">
          {c.apPaterno}
          {c.apMaterno ? ` ${c.apMaterno}` : ""}, {c.nombre}
        </span>
      )
    },
  },
  {
    id: "vendedor",
    header: "Vendedor",
    accessorFn: (row) => row.usuario.usuario,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.usuario.usuario}</span>
    ),
  },
  {
    header: "Pago",
    accessorKey: "tipoPago",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.tipoPago.tipoMetodo}</span>
    ),
  },
  {
    header: "Total",
    accessorKey: "total",
    cell: ({ row }) => (
      <span className="font-medium">Bs. {Number(row.original.total).toFixed(2)}</span>
    ),
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => (
      <Badge
        className={row.original.estado === "COMPLETADA" ? "bg-green-600" : ""}
        variant={row.original.estado === "COMPLETADA" ? "default" : "destructive"}
      >
        {row.original.estado}
      </Badge>
    ),
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => {
      const venta = row.original
      return (
        <div className="flex items-center gap-1">
          {onVerDetalle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVerDetalle(venta)}
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onAnular && venta.estado === "COMPLETADA" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAnular(venta)}
              title="Anular venta"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  },
]
