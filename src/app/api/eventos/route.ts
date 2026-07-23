import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  obtenerAccesoEventos,
  respuestaPermisosEventos,
} from "@/lib/eventos-permisos";

const ESTADOS_EVENTO = new Set([
  "PROXIMO",
  "EN_CURSO",
  "FINALIZADO",
  "CANCELADO",
]);

function textoOpcional(valor: unknown) {
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function fechaValida(valor: unknown) {
  if (typeof valor !== "string" || !valor) return null;

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso) {
      return NextResponse.json(
        { error: "No se pudo identificar tu usuario y rol" },
        { status: 403 },
      );
    }

    const soloCatalogos = req.nextUrl.searchParams.get("catalogos") === "1";

    if (soloCatalogos) {
      if (!acceso.puedeGestionar) {
        return NextResponse.json({
          responsables: [],
          permisos: respuestaPermisosEventos(acceso),
        });
      }

      const responsables = await prisma.usuario.findMany({
        where: {
          estado: "ACTIVO",
        },
        select: {
          id: true,
          usuario: true,
          tipoUsuario: {
            select: {
              rol: true,
            },
          },
        },
        orderBy: {
          usuario: "asc",
        },
      });

      return NextResponse.json({
        responsables,
        permisos: respuestaPermisosEventos(acceso),
      });
    }

    const eventos = await prisma.evento.findMany({
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
        _count: {
          select: {
            materiales: true,
          },
        },
      },
      orderBy: [
        {
          fechaInicio: "desc",
        },
        {
          creadoEn: "desc",
        },
      ],
    });

    return NextResponse.json({
      eventos,
      permisos: respuestaPermisosEventos(acceso),
    });
  } catch (error) {
    console.error("Error al consultar eventos:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los eventos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso) {
      return NextResponse.json(
        { error: "No se pudo identificar tu usuario y rol" },
        { status: 403 },
      );
    }

    if (!acceso.puedeGestionar) {
      return NextResponse.json(
        {
          error:
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para crear eventos.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const nombre = textoOpcional(body.nombre);
    const descripcion = textoOpcional(body.descripcion);
    const lugar = textoOpcional(body.lugar);
    const fechaInicio = fechaValida(body.fechaInicio);
    const fechaFin = body.fechaFin ? fechaValida(body.fechaFin) : null;
    const estado =
      typeof body.estado === "string" && ESTADOS_EVENTO.has(body.estado)
        ? body.estado
        : "PROXIMO";

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre del evento es obligatorio" },
        { status: 400 },
      );
    }

    if (!fechaInicio) {
      return NextResponse.json(
        { error: "La fecha de inicio no es válida" },
        { status: 400 },
      );
    }

    if (body.fechaFin && !fechaFin) {
      return NextResponse.json(
        { error: "La fecha de finalización no es válida" },
        { status: 400 },
      );
    }

    if (fechaFin && fechaFin < fechaInicio) {
      return NextResponse.json(
        { error: "La fecha final no puede ser anterior a la fecha de inicio" },
        { status: 400 },
      );
    }

    let idResponsable: number | null = null;

    if (body.idResponsable) {
      const id = Number(body.idResponsable);

      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          { error: "El responsable seleccionado no es válido" },
          { status: 400 },
        );
      }

      const responsableExiste = await prisma.usuario.findFirst({
        where: {
          id,
          estado: "ACTIVO",
        },
        select: {
          id: true,
        },
      });

      if (!responsableExiste) {
        return NextResponse.json(
          { error: "El responsable seleccionado no está disponible" },
          { status: 400 },
        );
      }

      idResponsable = responsableExiste.id;
    }

    const evento = await prisma.evento.create({
      data: {
        nombre,
        descripcion,
        lugar,
        fechaInicio,
        fechaFin,
        estado: estado as "PROXIMO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO",
        idResponsable,
        idCreadoPor: acceso.idUsuario,
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
      },
    });

    return NextResponse.json(
      {
        mensaje: "Evento creado correctamente",
        evento,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear evento:", error);

    return NextResponse.json(
      { error: "No se pudo crear el evento" },
      { status: 500 },
    );
  }
}