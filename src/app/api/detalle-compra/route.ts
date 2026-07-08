import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const detalleCompraSchema = z.object({
  id: z.number().optional(),
  idCompra: z.coerce.number().int().positive("Selecciona una compra"),
  idProducto: z.coerce.number().int().positive("Selecciona un producto"),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  precioCompra: z.coerce.number().positive("El precio debe ser mayor a 0"),
  subtotal: z.coerce.number().positive("El subtotal debe ser mayor a 0"),
});

export async function GET() {
  try {
    const detalles = await prisma.detalleCompra.findMany({
      include: { producto: true, compra: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(detalles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al listar detalles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = detalleCompraSchema.parse(body);

    const detalle = await prisma.detalleCompra.create({
      data: {
        idCompra: validated.idCompra,
        idProducto: validated.idProducto,
        cantidad: validated.cantidad,
        precioCompra: validated.precioCompra,
        subtotal: validated.subtotal,
      },
    });

    return NextResponse.json(detalle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear detalle" }, { status: 500 });
  }
}