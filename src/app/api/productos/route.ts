import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function limpiarTexto(valor: unknown) {
  if (typeof valor !== "string") return null
  const limpio = valor.trim()
  return limpio.length > 0 ? limpio : null
}

function limpiarFecha(valor: unknown) {
  if (typeof valor !== "string") return null
  if (!valor.trim()) return null
  return new Date(valor)
}

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { id: "desc" },
    })

    return NextResponse.json(productos)
  } catch (error) {
    console.error("Error al obtener materiales:", error)

    return NextResponse.json(
      { error: "Error al obtener materiales" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const nuevo = await prisma.producto.create({
      data: {
        idCategoriaProducto: Number(body.idCategoriaProducto),

        nombreProducto: body.nombreProducto,
        codigo: limpiarTexto(body.codigo),
        unidadMedida: limpiarTexto(body.unidadMedida) ?? "Unidad",
        ubicacion: limpiarTexto(body.ubicacion),
        fechaVencimiento: limpiarFecha(body.fechaVencimiento),
        observacion: limpiarTexto(body.observacion),
        fotoUrl: limpiarTexto(body.fotoUrl),
        observacionFoto: limpiarTexto(body.observacionFoto),

        marca: body.marca || "Inventario MKT",
        talla: body.talla || "N/A",
        color: body.color || "N/A",
        temporada: body.temporada || "TODO_EL_ANNO",

        precioVenta: Number(body.precioVenta ?? 0),
        costo: Number(body.costo ?? 0),
        margen: Number(body.margen ?? 0),
        stock: Number(body.stock ?? 0),
        stockMinimo: Number(body.stockMinimo ?? 0),
        estado: body.estado || "ACTIVO",
      },
    })

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error) {
    console.error("Error al crear material:", error)

    return NextResponse.json(
      { error: "Error al crear material" },
      { status: 500 }
    )
  }
}
