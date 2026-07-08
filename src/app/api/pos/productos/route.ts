import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  const productos = await prisma.producto.findMany({
    where: {
      estado: "ACTIVO",
      ...(q
        ? {
            OR: [
              { nombreProducto: { contains: q, mode: "insensitive" } },
              { marca: { contains: q, mode: "insensitive" } },
              { color: { contains: q, mode: "insensitive" } },
              { talla: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { categoria: true },
    orderBy: { nombreProducto: "asc" },
    take: 60,
  })

  return NextResponse.json(productos)
}
