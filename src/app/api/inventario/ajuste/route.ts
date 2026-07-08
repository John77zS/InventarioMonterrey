import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ajusteSchema = z.object({
  idProducto: z.number().int().positive(),
  cantidad: z
    .number()
    .int()
    .refine((v) => v !== 0, {
      message: "La cantidad no puede ser 0",
    }),
  motivo: z.string().min(5, "El motivo debe tener al menos 5 caracteres"),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (session.user.rol !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede realizar ajustes de inventario" },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const result = ajusteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      )
    }

    const { idProducto, cantidad, motivo } = result.data

    const material = await prisma.producto.findUnique({
      where: {
        id: idProducto,
      },
      select: {
        id: true,
        codigo: true,
        nombreProducto: true,
        stock: true,
        unidadMedida: true,
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      )
    }

    const nuevoStock = material.stock + cantidad

    if (nuevoStock < 0) {
      return NextResponse.json(
        {
          error: `Stock insuficiente. Stock actual: ${material.stock}, ajuste solicitado: ${cantidad}`,
        },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.producto.update({
        where: {
          id: idProducto,
        },
        data: {
          stock: {
            increment: cantidad,
          },
        },
      }),

      prisma.movimientoInventario.create({
        data: {
          idProducto,
          idUsuario: session.user.id,
          tipo: "AJUSTE",
          origen: "AJUSTE_MANUAL",
          cantidad,
          descripcion: `Ajuste manual de material: ${motivo}`,
        },
      }),
    ])

    return NextResponse.json(
      {
        message: "Ajuste de inventario realizado correctamente",
        material: material.nombreProducto,
        stockAnterior: material.stock,
        cantidadAjustada: cantidad,
        nuevoStock,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al realizar ajuste de inventario:", error)

    return NextResponse.json(
      { error: "Error al realizar el ajuste de inventario" },
      { status: 500 }
    )
  }
}
