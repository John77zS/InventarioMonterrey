"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShoppingCart, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ProductSearch, { type ProductoPOS } from "@/components/pos/product-search"
import Cart, { type CartItem } from "@/components/pos/cart"
import CheckoutDialog from "@/components/pos/checkout-dialog"

export default function PosPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [sesionActiva, setSesionActiva] = useState<boolean | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    fetch("/api/sesion-caja")
      .then((r) => r.json())
      .then((data) => setSesionActiva(!!data.sesion))
      .catch(() => setSesionActiva(false))
  }, [])

  const addToCart = useCallback((producto: ProductoPOS) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === producto.id)
      if (existing) {
        if (existing.cantidad >= producto.stock) {
          toast.warning(
            `"${producto.nombreProducto}" solo tiene ${producto.stock} unidades disponibles`
          )
          return prev
        }
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombreProducto: producto.nombreProducto,
          talla: producto.talla,
          color: producto.color,
          precioVenta: Number(producto.precioVenta),
          stock: producto.stock,
          cantidad: 1,
        },
      ]
    })
    toast.success(`"${producto.nombreProducto}" agregado al carrito`, { duration: 1200 })
  }, [])

  const updateQuantity = useCallback((id: number, cantidad: number) => {
    if (cantidad < 1) return
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)))
  }, [])

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const subtotal = cart.reduce((acc, i) => acc + i.precioVenta * i.cantidad, 0)
  const totalItems = cart.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-9rem)]">
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="text-2xl font-bold">Punto de Venta</h1>
        {sesionActiva === false && (
          <Alert variant="destructive" className="py-2 flex-1 max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No hay sesión de caja activa.{" "}
              <button
                className="underline font-semibold"
                onClick={() => router.push("/caja")}
              >
                Abrir caja →
              </button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-[3] flex flex-col rounded-lg border bg-card p-4 overflow-hidden">
          <ProductSearch onAddToCart={addToCart} />
        </div>

        <div className="flex-[2] flex flex-col rounded-lg border bg-card p-4 min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold">Carrito</h2>
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <Cart items={cart} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          </div>

          <div className="mt-3 shrink-0 space-y-3">
            <Separator />

            {cart.length > 0 && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Bs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">Bs. {subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-muted-foreground">Bs. 0.00</span>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={cart.length === 0 || sesionActiva === false}
              onClick={() => setCheckoutOpen(true)}
            >
              Confirmar Venta
              {subtotal > 0 && ` · Bs. ${subtotal.toFixed(2)}`}
            </Button>

            {sesionActiva === false && (
              <p className="text-xs text-center text-muted-foreground">
                Necesitas abrir la caja para registrar ventas
              </p>
            )}
          </div>
        </div>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onSuccess={clearCart}
      />
    </div>
  )
}
