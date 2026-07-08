"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import CompraForm from "@/components/forms/compra-form"
import { DataTable } from "@/components/ui/data-table"
import { createComprasColumns, CompraRow } from "@/components/tables/compras-columns"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Boxes, Package, ShoppingBag, TrendingDown } from "lucide-react"

interface Proveedor {
  id: number
  nombreEmpresa: string
}

interface Producto {
  id: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  costo: number
  stock: number
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

export default function ComprasPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [compras, setCompras] = useState<CompraRow[]>([])
  const [loadingCompras, setLoadingCompras] = useState(true)

  const [detailCompra, setDetailCompra] = useState<CompraRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [resProv, resProd] = await Promise.all([
        fetch("/api/proveedores"),
        fetch("/api/productos"),
      ])

      const proveedoresData = await resProv.json()
      const productosData = await resProd.json()

      setProveedores(Array.isArray(proveedoresData) ? proveedoresData : [])
      setProductos(Array.isArray(productosData) ? productosData : [])
    } catch {
      toast.error("Error al cargar proveedores y materiales")
    }
  }, [])

  const fetchCompras = useCallback(async () => {
    try {
      setLoadingCompras(true)
      const res = await fetch("/api/compras")
      const data = await res.json()
      setCompras(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Error al cargar entradas de material")
    } finally {
      setLoadingCompras(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchCompras()
  }, [fetchData, fetchCompras])

  const handleSuccess = useCallback(() => {
    fetchData()
    fetchCompras()
  }, [fetchData, fetchCompras])

  const handleVerDetalle = useCallback((compra: CompraRow) => {
    setDetailCompra(compra)
    setDetailOpen(true)
  }, [])

  const columns = useMemo(
    () => createComprasColumns(handleVerDetalle),
    [handleVerDetalle]
  )

  const stats = useMemo(() => {
    const totalReferencial = compras.reduce((acc, c) => acc + Number(c.total), 0)

    const totalUnidades = compras.reduce(
      (acc, c) =>
        acc + c.detalles.reduce((sum, d) => sum + Number(d.cantidad), 0),
      0
    )

    return {
      totalReferencial,
      totalEntradas: compras.length,
      totalUnidades,
    }
  }, [compras])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Boxes className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Inventario MKT
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Entradas de Material
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Registra ingresos de materiales al inventario y actualiza el stock disponible.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-red-600">
          Registrar nueva entrada
        </p>

        <CompraForm
          proveedores={proveedores}
          productos={productos}
          onSuccess={handleSuccess}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Historial de Entradas
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor referencial
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Bs. {stats.totalReferencial.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total de entradas registradas
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entradas registradas
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntradas}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ingresos de material
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unidades ingresadas
              </CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnidades}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Cantidad total recibida
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          {loadingCompras ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Cargando entradas de material...
            </p>
          ) : compras.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-30" />
              <p className="font-medium">
                No hay entradas de material registradas todavía
              </p>
            </div>
          ) : (
            <DataTable searchKey="proveedor" columns={columns} data={compras} />
          )}
        </div>
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setDetailCompra(null)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entrada de Material #{detailCompra?.id}</DialogTitle>
          </DialogHeader>

          {detailCompra && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </p>
                  <p className="font-medium">{formatFecha(detailCompra.fecha)}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Registrado por
                  </p>
                  <p className="font-medium">{detailCompra.usuario.usuario}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Proveedor
                  </p>
                  <p className="font-medium">
                    {detailCompra.proveedor.nombreEmpresa}
                  </p>
                </div>

                {detailCompra.numeroDocumento && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Documento
                    </p>
                    <p className="font-medium">
                      {detailCompra.tipoDocumento && (
                        <span className="mr-1 text-muted-foreground">
                          {detailCompra.tipoDocumento}
                        </span>
                      )}
                      {detailCompra.numeroDocumento}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-sm font-medium">
                  Materiales ingresados ({detailCompra.detalles.length})
                </p>

                <div className="space-y-2">
                  {detailCompra.detalles.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {d.producto.nombreProducto}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-muted-foreground">
                          {d.cantidad} x Bs. {Number(d.precioCompra).toFixed(2)}
                        </p>
                        <p className="font-semibold">
                          Bs. {Number(d.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal referencial</span>
                  <span>Bs. {Number(detailCompra.subtotal).toFixed(2)}</span>
                </div>

                {Number(detailCompra.descuento) > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Descuento / ajuste</span>
                    <span>- Bs. {Number(detailCompra.descuento).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-1 text-base font-bold">
                  <span>Total referencial</span>
                  <span>Bs. {Number(detailCompra.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
