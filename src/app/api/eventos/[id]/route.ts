import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  obtenerAccesoEventos,
  respuestaPermisosEventos,
} from "@/lib/eventos-permisos";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function obtenerId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const idEvento = obtenerId(idParam);

  if (!idEvento) {
    return NextResponse.json(
      { error: "El identificador del evento no es válido" },
      { status: 400 },
    );
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso) {
      return NextResponse.json(
        { error: "No se pudo identificar tu usuario y rol" },
        { status: 403 },
      );
    }

    const [evento, productos] = await Promise.all([
      prisma.evento.findUnique({
        where: {
          id: idEvento,
        },
        include: {
          responsable: {
            select: {
              id: true,
              usuario: true,
            },
          },
          creadoPor: {
            select: {
              id: true,
              usuario: true,
            },
          },
          materiales: {
            include: {
              producto: {
                select: {
                  id: true,
                  codigo: true,
                  nombreProducto: true,
                  unidadMedida: true,
                  ubicacion: true,
                  stock: true,
                  stockMinimo: true,
                },
              },
            },
            orderBy: {
              creadoEn: "asc",
            },
          },
          gastos: {
            orderBy: [
              {
                fechaGasto: "desc",
              },
              {
                id: "desc",
              },
            ],
          },
        },
      }),
      prisma.producto.findMany({
        where: {
          estado: "ACTIVO",
        },
        select: {
          id: true,
          codigo: true,
          nombreProducto: true,
          unidadMedida: true,
          ubicacion: true,
          stock: true,
          stockMinimo: true,
        },
        orderBy: {
          nombreProducto: "asc",
        },
      }),
    ]);

    if (!evento) {
      return NextResponse.json(
        { error: "El evento no existe" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      evento,
      productos,
      permisos: respuestaPermisosEventos(acceso),
    });
  } catch (error) {
    console.error("Error al cargar el detalle del evento:", error);

    return NextResponse.json(
      { error: "No se pudo cargar el detalle del evento" },
      { status: 500 },
    );
  }
}