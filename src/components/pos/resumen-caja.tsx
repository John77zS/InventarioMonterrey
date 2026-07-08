"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Clock, ShoppingCart, DollarSign, Banknote, Loader2 } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SesionData {
  id: number
  horaApertura: string
  montoInicial: string
  ventas: { total: string }[]
}

interface ResumenCajaProps {
  sesion: SesionData
}

export function ResumenCaja({ sesion }: ResumenCajaProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  const cantidadVentas = sesion.ventas.length
  const totalVendido = sesion.ventas.reduce((sum, v) => sum + parseFloat(v.total), 0)
  const montoInicial = parseFloat(sesion.montoInicial)
  const totalEnCaja = montoInicial + totalVendido

  const horaApertura = new Date(sesion.horaApertura)

  const fmt = (n: number) =>
    n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  async function handleCerrarCaja() {
    setIsClosing(true)
    try {
      const res = await fetch(`/api/sesion-caja/${sesion.id}`, { method: "PUT" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Error al cerrar la caja")
        return
      }
      toast.success("Caja cerrada exitosamente")
      router.refresh()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hora de apertura</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {horaApertura.toLocaleTimeString("es-BO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {horaApertura.toLocaleDateString("es-BO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto inicial</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {fmt(montoInicial)}</div>
            <p className="text-xs text-muted-foreground">efectivo al abrir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del turno</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cantidadVentas}</div>
            <p className="text-xs text-muted-foreground">transacciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vendido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {fmt(totalVendido)}</div>
            <p className="text-xs text-muted-foreground">
              Total en caja: Bs. {fmt(totalEnCaja)}
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Cerrar Caja</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cierre de caja?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Se registrará el cierre de la sesión actual con el siguiente resumen:</p>
                <div className="rounded-md bg-muted p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora de apertura:</span>
                    <span className="font-medium">
                      {horaApertura.toLocaleString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto inicial:</span>
                    <span className="font-medium">Bs. {fmt(montoInicial)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ventas completadas:</span>
                    <span className="font-medium">{cantidadVentas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total vendido:</span>
                    <span className="font-medium">Bs. {fmt(totalVendido)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5">
                    <span className="text-muted-foreground font-semibold">
                      Total esperado en caja:
                    </span>
                    <span className="font-bold text-foreground">Bs. {fmt(totalEnCaja)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrarCaja}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
