"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, PackageCheck } from "lucide-react"

export interface DetalleCompraRow {
  id: number
  cantidad: number
  precioCompra: number
  subtotal: number
  producto: {
    id?: number
    codigo?: string | null
    nombreProducto: string
    unidadMedida?: string | null
    talla?: string
    color?: string
  }
}

export interface CompraRow {
  id: number
  fecha: string
  subtotal: number
  descuento: number
  total: number
  numeroDocumento: string | null
  tipoDocumento: string | null
  estado?: "ACTIVO" | "INACTIVO"
  proveedor: { nombreEmpresa: string }
  usuario: { usuario: string }
  detalles: DetalleCompraRow[]
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

export const createComprasColumns = (
  onVerDetalle?: (compra: CompraRow) => void
): ColumnDef<CompraRow>[] => [
  {
    header: "Entrada",
    accessorKey: "id",
    size: 80,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-red-50 p-2 text-red-600">
          <PackageCheck className="h-4 w-4" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-700">
          #{row.original.id}
        </span>
      </div>
    ),
  },
  {
    header: "Fecha de ingreso",
    accessorKey: "fecha",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-slate-700">
        {formatFecha(row.original.fecha)}
      </span>
    ),
  },
  {
    header: "Proveedor",
    id: "proveedor",
    accessorFn: (row) => row.proveedor.nombreEmpresa,
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.proveedor.nombreEmpresa}
        </p>
        <p className="text-xs text-slate-500">
          Registrado por {row.original.usuario.usuario}
        </p>
      </div>
    ),
  },
  {
    header: "Documento",
    id: "documento",
    cell: ({ row }) => {
      const numero = row.original.numeroDocumento
      const tipo = row.original.tipoDocumento

      if (!numero) {
        return <span className="text-xs text-muted-foreground">Sin documento</span>
      }

      return (
        <div className="text-sm">
          {tipo && (
            <p className="text-xs text-muted-foreground">
              {tipo}
            </p>
          )}
          <p className="font-medium text-slate-700">{numero}</p>
        </div>
      )
    },
  },
  {
    header: "Materiales",
    id: "items",
    cell: ({ row }) => {
      const count = row.original.detalles.length

      return (
        <Badge variant="secondary" className="font-normal">
          {count} {count === 1 ? "material" : "materiales"}
        </Badge>
      )
    },
  },
  {
    header: "Unidades",
    id: "unidades",
    cell: ({ row }) => {
      const totalUnidades = row.original.detalles.reduce(
        (acc, item) => acc + Number(item.cantidad),
        0
      )

      return (
        <span className="text-sm font-semibold text-slate-900">
          {totalUnidades}
        </span>
      )
    },
  },
  {
    header: "Valor referencial",
    accessorKey: "total",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-slate-900">
        Bs. {Number(row.original.total).toFixed(2)}
      </span>
    ),
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => {
      const estado = row.original.estado ?? "ACTIVO"

      return (
        <Badge className={estado === "ACTIVO" ? "bg-green-600" : "bg-gray-400"}>
          {estado === "ACTIVO" ? "Registrada" : "Anulada"}
        </Badge>
      )
    },
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) =>
      onVerDetalle ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onVerDetalle(row.original)}
          title="Ver detalle de entrada"
        >
          <Eye className="h-4 w-4 text-red-600" />
        </Button>
      ) : null,
  },
]
