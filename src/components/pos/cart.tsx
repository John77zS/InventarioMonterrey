"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type CartItem = {
  id: number
  nombreProducto: string
  talla: string
  color: string
  precioVenta: number
  stock: number
  cantidad: number
}

type Props = {
  items: CartItem[]
  onUpdateQuantity: (id: number, cantidad: number) => void
  onRemove: (id: number) => void
}

export default function Cart({ items, onUpdateQuantity, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-[8rem] items-center justify-center">
        <p className="text-sm text-muted-foreground">El carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-lg border bg-background p-2 text-sm"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium leading-tight truncate">{item.nombreProducto}</p>
            <p className="text-xs text-muted-foreground">
              T: {item.talla} · {item.color}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-semibold tabular-nums">
              {item.cantidad}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              disabled={item.cantidad >= item.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <span className="w-20 text-right font-semibold shrink-0 tabular-nums text-xs">
            Bs. {(item.precioVenta * item.cantidad).toFixed(2)}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
