"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export type ProductoPOS = {
  id: number
  nombreProducto: string
  marca: string | null
  talla: string
  color: string
  precioVenta: string | number
  stock: number
  categoria: { id: number; nombreCategoria: string }
}

type Props = {
  onAddToCart: (producto: ProductoPOS) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ProductSearch({ onAddToCart }: Props) {
  const [query, setQuery] = useState("")
  const [productos, setProductos] = useState<ProductoPOS[]>([])
  const [loading, setLoading] = useState(true)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    setLoading(true)
    const params = debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ""
    fetch(`/api/pos/productos${params}`)
      .then((r) => r.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre, talla, color, marca..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {query ? `Sin resultados para "${query}"` : "No hay productos activos"}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
            {productos.map((p) => (
              <button
                key={p.id}
                onClick={() => onAddToCart(p)}
                disabled={p.stock === 0}
                className="group text-left border rounded-lg p-3 hover:bg-accent hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-background"
              >
                <p className="font-medium text-sm leading-tight truncate">
                  {p.nombreProducto}
                </p>
                {p.marca && (
                  <p className="text-xs text-muted-foreground truncate">{p.marca}</p>
                )}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs py-0 px-1.5 font-normal">
                    T: {p.talla}
                  </Badge>
                  <Badge variant="outline" className="text-xs py-0 px-1.5 font-normal">
                    {p.color}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary">
                    Bs. {Number(p.precioVenta).toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      p.stock === 0 ? "destructive" : p.stock <= 3 ? "secondary" : "default"
                    }
                    className="text-xs"
                  >
                    {p.stock === 0 ? "Sin stock" : `${p.stock} disp.`}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
