"use client"

import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, ShoppingBag } from "lucide-react"
import type { VentaRow } from "@/components/tables/ventas-columns"

function formatHora(dateStr: string) {
  return new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateStr))
}

export function VentasSesionActual() {
  const [ventas, setVentas] = useState<VentaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detailVenta, setDetailVenta] = useState<VentaRow | null>(null)

  const fetchVentas = useCallback(async () => {
    try {
      const res = await fetch("/api/ventas?sesion=actual")
      const data = await res.json()
      setVentas(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()
    const interval = setInterval(fetchVentas, 30000)
    return () => clearInterval(interval)
  }, [fetchVentas])

  const completadas = ventas.filter((v) => v.estado === "COMPLETADA")
  const anuladas = ventas.filter((v) => v.estado === "ANULADA")

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            Ventas de este turno
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-600 font-medium">{completadas.length} completadas</span>
            {anuladas.length > 0 && (
              <>
                <span>·</span>
                <span className="text-destructive font-medium">{anuladas.length} anuladas</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-sm text-muted-foreground px-6 py-4">Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-8 text-center">
              No hay ventas registradas en este turno
            </p>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-16">Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-24">Estado</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{venta.id}
                      </TableCell>
                      <TableCell className="text-sm">{formatHora(venta.fecha)}</TableCell>
                      <TableCell className="text-sm">
                        {venta.cliente.apPaterno}
                        {venta.cliente.apMaterno ? ` ${venta.cliente.apMaterno}` : ""},
                        {" "}{venta.cliente.nombre}
                      </TableCell>
                      <TableCell className="text-sm">{venta.tipoPago.tipoMetodo}</TableCell>
                      <TableCell className="text-right font-medium">
                        Bs. {Number(venta.total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={venta.estado === "COMPLETADA" ? "bg-green-600" : ""}
                          variant={venta.estado === "COMPLETADA" ? "default" : "destructive"}
                        >
                          {venta.estado === "COMPLETADA" ? "OK" : "ANULADA"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setDetailVenta(venta)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailVenta} onOpenChange={(open) => !open && setDetailVenta(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Venta #{detailVenta?.id}
              {detailVenta && (
                <Badge
                  className={detailVenta.estado === "COMPLETADA" ? "bg-green-600" : ""}
                  variant={detailVenta.estado === "COMPLETADA" ? "default" : "destructive"}
                >
                  {detailVenta.estado}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {detailVenta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Cliente</p>
                  <p className="font-medium">
                    {detailVenta.cliente.apPaterno}
                    {detailVenta.cliente.apMaterno ? ` ${detailVenta.cliente.apMaterno}` : ""},
                    {" "}{detailVenta.cliente.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Pago</p>
                  <p className="font-medium">{detailVenta.tipoPago.tipoMetodo}</p>
                </div>
              </div>

              {detailVenta.motivoAnulacion && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
                  <p className="font-medium text-destructive">Motivo de anulación</p>
                  <p className="text-destructive/80 mt-1">{detailVenta.motivoAnulacion}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                {detailVenta.detalles.map((d) => (
                  <div
                    key={d.id}
                    className="flex justify-between items-center rounded-md border p-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">{d.producto.nombreProducto}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.producto.talla} · {d.producto.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">
                        {d.cantidad} × Bs. {Number(d.precio).toFixed(2)}
                      </p>
                      <p className="font-semibold">Bs. {Number(d.subtotal).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">Bs. {Number(detailVenta.total).toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
