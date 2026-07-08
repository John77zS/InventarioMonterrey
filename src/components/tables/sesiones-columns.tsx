"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export interface SesionRow {
  id: number
  usuario: { id: number; usuario: string }
  horaApertura: string
  horaCierre: string | null
  montoInicial: number
  montoFinal: number | null
  estado: "ABIERTA" | "CERRADA"
  cantidadVentas: number
  cantidadAnuladas: number
  totalVendido: number
  duracionMin: number | null
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

function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export const createSesionesColumns = (
  showUsuario: boolean
): ColumnDef<SesionRow>[] => {
  const cols: ColumnDef<SesionRow>[] = []

  if (showUsuario) {
    cols.push({
      id: "usuario",
      header: "Vendedor",
      accessorFn: (row) => row.usuario.usuario,
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.usuario.usuario}</span>
      ),
    })
  }

  cols.push(
    {
      header: "Apertura",
      accessorKey: "horaApertura",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{formatFecha(row.original.horaApertura)}</span>
      ),
    },
    {
      header: "Cierre",
      accessorKey: "horaCierre",
      cell: ({ row }) =>
        row.original.horaCierre ? (
          <span className="text-sm whitespace-nowrap">
            {formatFecha(row.original.horaCierre)}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">En curso</span>
        ),
    },
    {
      header: "Duración",
      accessorKey: "duracionMin",
      cell: ({ row }) =>
        row.original.duracionMin !== null ? (
          <span className="text-sm">{formatDuracion(row.original.duracionMin)}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Ventas",
      accessorKey: "cantidadVentas",
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-medium">{row.original.cantidadVentas}</span>
          {row.original.cantidadAnuladas > 0 && (
            <span className="text-destructive ml-1 text-xs">
              ({row.original.cantidadAnuladas} anuladas)
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Total Vendido",
      accessorKey: "totalVendido",
      cell: ({ row }) => (
        <span className="font-medium">Bs. {row.original.totalVendido.toFixed(2)}</span>
      ),
    },
    {
      header: "Monto Inicial",
      accessorKey: "montoInicial",
      cell: ({ row }) => (
        <span className="text-sm">Bs. {row.original.montoInicial.toFixed(2)}</span>
      ),
    },
    {
      header: "Monto Final",
      accessorKey: "montoFinal",
      cell: ({ row }) =>
        row.original.montoFinal !== null ? (
          <span className="text-sm font-medium">
            Bs. {row.original.montoFinal.toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }) => (
        <Badge
          className={row.original.estado === "ABIERTA" ? "bg-green-600" : ""}
          variant={row.original.estado === "ABIERTA" ? "default" : "secondary"}
        >
          {row.original.estado}
        </Badge>
      ),
    }
  )

  return cols
}
