"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  Barcode,
  Edit,
  MapPin,
  MoreHorizontal,
  Package,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ProductoRow {
  id: number
  codigo?: string | null
  nombreProducto: string
  categoria?: {
    id: number
    nombreCategoria: string
  } | null
  unidadMedida?: string | null
  ubicacion?: string | null
  stock: number
  stockMinimo: number
  costo?: number
  precioVenta?: number
  estado: "ACTIVO" | "INACTIVO"
  fechaVencimiento?: string | null
  observacion?: string | null
}

export function createProductosColumns(
  onToggleEstado: (id: number, estado: "ACTIVO" | "INACTIVO") => void,
  onEdit: (producto: ProductoRow) => void
): ColumnDef<ProductoRow>[] {
  return [
    {
      header: "Código",
      accessorKey: "codigo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Barcode className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.codigo || "Sin código"}</span>
        </div>
      ),
    },
    {
      header: "Material",
      accessorKey: "nombreProducto",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600">
            <Package className="h-4 w-4" />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {row.original.nombreProducto}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.categoria?.nombreCategoria || "Sin categoría"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Unidad",
      accessorKey: "unidadMedida",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.unidadMedida || "Unidad"}
        </span>
      ),
    },
    {
      header: "Ubicación",
      accessorKey: "ubicacion",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.ubicacion || "Sin ubicación"}</span>
        </div>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: ({ row }) => {
        const stock = Number(row.original.stock || 0)
        const minimo = Number(row.original.stockMinimo || 0)

        return (
          <div className="text-right">
            <p className="font-semibold">{stock}</p>
            <p className="text-xs text-muted-foreground">
              Mín: {minimo}
            </p>
          </div>
        )
      },
    },
    {
      header: "Estado stock",
      cell: ({ row }) => {
        const stock = Number(row.original.stock || 0)
        const minimo = Number(row.original.stockMinimo || 0)

        if (stock <= 0) {
          return <Badge className="bg-red-600">Sin stock</Badge>
        }

        if (stock <= minimo) {
          return <Badge className="bg-yellow-500">Stock bajo</Badge>
        }

        return <Badge className="bg-green-600">Disponible</Badge>
      },
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
          {row.original.estado === "ACTIVO" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => {
        const producto = row.original

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(producto)}
              title="Editar material"
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
                {producto.estado === "ACTIVO" ? (
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onToggleEstado(producto.id, "INACTIVO")}
                  >
                    Desactivar material
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-green-600 focus:text-green-600"
                    onClick={() => onToggleEstado(producto.id, "ACTIVO")}
                  >
                    Activar material
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
