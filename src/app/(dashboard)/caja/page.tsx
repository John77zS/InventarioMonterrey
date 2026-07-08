import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Vault } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AbrirCajaForm } from "@/components/forms/abrir-caja-form"
import { ResumenCaja } from "@/components/pos/resumen-caja"
import { VentasSesionActual } from "@/components/pos/ventas-sesion-actual"

export default async function CajaPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const sesionActiva = await prisma.sesionCaja.findFirst({
    where: {
      idUsuario: session.user.id,
      estado: "ABIERTA",
    },
    include: {
      ventas: {
        where: { estado: "COMPLETADA" },
        select: { total: true },
      },
    },
  })

  const sesionData = sesionActiva
    ? {
        id: sesionActiva.id,
        horaApertura: sesionActiva.horaApertura.toISOString(),
        montoInicial: sesionActiva.montoInicial.toString(),
        ventas: sesionActiva.ventas.map((v) => ({
          total: v.total.toString(),
        })),
      }
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesión de Caja</h1>
          <p className="text-sm text-muted-foreground">
            {sesionData ? "Turno en curso" : "Sin turno activo"}
          </p>
        </div>
        <Badge
          variant={sesionData ? "default" : "secondary"}
          className="text-sm px-3 py-1"
        >
          {sesionData ? "ABIERTA" : "CERRADA"}
        </Badge>
      </div>

      {sesionData ? (
        <>
          <ResumenCaja sesion={sesionData} />
          <VentasSesionActual />
        </>
      ) : (
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Vault className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Abrir caja</CardTitle>
                <CardDescription>
                  Ingresa el monto inicial para comenzar el turno
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AbrirCajaForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
