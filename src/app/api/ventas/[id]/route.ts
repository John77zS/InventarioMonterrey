import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const anularVentaSchema = z.object({
  motivoAnulacion: z
    .string()
    .min(5, "El motivo de anulación debe tener al menos 5 caracteres"),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  if (session.user.rol !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo los administradores pueden anular ventas" },
      { status: 403 }
    )
  }

  const { id } = await params
  const ventaId = Number(id)

  const body = await req.json()
  const result = anularVentaSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const venta = await prisma.venta.findUnique({
    where: { id: ventaId },
    include: { detalles: true },
  })

  if (!venta) {
    return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
  }
  if (venta.estado === "ANULADA") {
    return NextResponse.json({ error: "La venta ya está anulada" }, { status: 409 })
  }

  const ventaAnulada = await prisma.$transaction(async (tx) => {
    const updated = await tx.venta.update({
      where: { id: ventaId },
      data: {
        estado: "ANULADA",
        motivoAnulacion: result.data.motivoAnulacion,
      },
    })

    for (const detalle of venta.detalles) {
      await tx.producto.update({
        where: { id: detalle.idProducto },
        data: { stock: { increment: detalle.cantidad } },
      })

      await tx.movimientoInventario.create({
        data: {
          idProducto: detalle.idProducto,
          idUsuario: session.user.id,
          tipo: "AJUSTE",
          origen: "DEVOLUCION",
          cantidad: detalle.cantidad,
          descripcion: `Anulación venta #${ventaId}: ${result.data.motivoAnulacion}`,
        },
      })
    }

    return updated
  })

  return NextResponse.json(ventaAnulada)
}
