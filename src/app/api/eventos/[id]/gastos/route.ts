import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerAccesoEventos } from "@/lib/eventos-permisos";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const TIPOS_CONTROL = new Set(["SERVICIO", "CONSUMIBLE", "RETORNABLE"]);

function obtenerId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function textoObligatorio(valor: unknown) {
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function textoOpcional(valor: unknown) {
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function numeroPositivo(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function numeroNoNegativo(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function obtenerFechaGasto(valor: unknown) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return new Date();
  }

  const fecha = new Date(`${valor}T12:00:00-04:00`);
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
}

export async function POST(req: NextRequest, context: RouteContext) {
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

    if (!acceso?.puedeGestionar) {
      return NextResponse.json(
        {
          error:
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para modificar gastos.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();

    const grupo = textoObligatorio(body.grupo);
    const gestionCompra = textoObligatorio(body.gestionCompra) || "Compras";
    const proveedor = textoObligatorio(body.proveedor);
    const item = textoObligatorio(body.item);
    const cantidadCompra = numeroPositivo(body.cantidadCompra);
    const unidadCompra = textoObligatorio(body.unidadCompra);
    const costoUnitario = numeroPositivo(body.costoUnitario);
    const tipoControl =
      typeof body.tipoControl === "string" &&
      TIPOS_CONTROL.has(body.tipoControl)
        ? body.tipoControl
        : null;

    if (!grupo || !proveedor || !item) {
      return NextResponse.json(
        { error: "Completa el grupo, proveedor y nombre del ítem" },
        { status: 400 },
      );
    }

    if (!cantidadCompra || !unidadCompra || !costoUnitario) {
      return NextResponse.json(
        { error: "La cantidad, unidad y costo deben ser válidos" },
        { status: 400 },
      );
    }

    if (!tipoControl) {
      return NextResponse.json(
        { error: "Selecciona un tipo de control válido" },
        { status: 400 },
      );
    }

    const esServicio = tipoControl === "SERVICIO";
    const factorConversion = esServicio
      ? 1
      : numeroPositivo(body.factorConversion);
    const unidadControl = esServicio
      ? "servicio"
      : textoObligatorio(body.unidadControl);

    if (!factorConversion || !unidadControl) {
      return NextResponse.json(
        {
          error:
            "Indica cuántas unidades contiene cada paquete y qué unidad se controlará",
        },
        { status: 400 },
      );
    }

    const evento = await prisma.evento.findUnique({
      where: {
        id: idEvento,
      },
      select: {
        id: true,
        estado: true,
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "El evento no existe" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se pueden registrar gastos en un evento cerrado" },
        { status: 409 },
      );
    }

    const cantidadControl = cantidadCompra * factorConversion;
    const totalGastado = cantidadCompra * costoUnitario;

    const gasto = await prisma.eventoGasto.create({
      data: {
        idEvento,
        grupo,
        gestionCompra,
        proveedor,
        item,
        cantidadCompra,
        unidadCompra,
        factorConversion,
        cantidadControl,
        unidadControl,
        costoUnitario,
        totalGastado,
        tipoControl: tipoControl as "SERVICIO" | "CONSUMIBLE" | "RETORNABLE",
        controlaStock: esServicio ? false : body.controlaStock !== false,
        estado: "REGISTRADO",
        fechaGasto: obtenerFechaGasto(body.fechaGasto),
        numeroDocumento: textoOpcional(body.numeroDocumento),
        observacion: textoOpcional(body.observacion),
      },
    });

    return NextResponse.json(
      {
        mensaje: "Gasto registrado correctamente",
        gasto,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al registrar el gasto del evento:", error);

    return NextResponse.json(
      { error: "No se pudo registrar el gasto del evento" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const idEvento = obtenerId(idParam);
  const idGasto = obtenerId(req.nextUrl.searchParams.get("gastoId") || "");

  if (!idEvento || !idGasto) {
    return NextResponse.json(
      { error: "Los identificadores enviados no son válidos" },
      { status: 400 },
    );
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso?.puedeGestionar) {
      return NextResponse.json(
        {
          error:
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para modificar gastos.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();

    const grupo = textoObligatorio(body.grupo);
    const gestionCompra = textoObligatorio(body.gestionCompra) || "Compras";
    const proveedor = textoObligatorio(body.proveedor);
    const item = textoObligatorio(body.item);
    const cantidadCompra = numeroPositivo(body.cantidadCompra);
    const unidadCompra = textoObligatorio(body.unidadCompra);
    const costoUnitario = numeroPositivo(body.costoUnitario);
    const tipoControl =
      typeof body.tipoControl === "string" &&
      TIPOS_CONTROL.has(body.tipoControl)
        ? body.tipoControl
        : null;

    if (!grupo || !proveedor || !item) {
      return NextResponse.json(
        { error: "Completa el grupo, proveedor y nombre del ítem" },
        { status: 400 },
      );
    }

    if (!cantidadCompra || !unidadCompra || !costoUnitario) {
      return NextResponse.json(
        { error: "La cantidad, unidad y costo deben ser válidos" },
        { status: 400 },
      );
    }

    if (!tipoControl) {
      return NextResponse.json(
        { error: "Selecciona un tipo de control válido" },
        { status: 400 },
      );
    }

    const esServicio = tipoControl === "SERVICIO";
    const factorConversion = esServicio
      ? 1
      : numeroPositivo(body.factorConversion);
    const unidadControl = esServicio
      ? "servicio"
      : textoObligatorio(body.unidadControl);

    if (!factorConversion || !unidadControl) {
      return NextResponse.json(
        {
          error:
            "Indica cuántas unidades contiene cada paquete y qué unidad se controlará",
        },
        { status: 400 },
      );
    }

    const [evento, gastoActual] = await Promise.all([
      prisma.evento.findUnique({
        where: {
          id: idEvento,
        },
        select: {
          id: true,
          estado: true,
        },
      }),
      prisma.eventoGasto.findFirst({
        where: {
          id: idGasto,
          idEvento,
        },
        select: {
          id: true,
          cantidadLlevada: true,
        },
      }),
    ]);

    if (!evento || !gastoActual) {
      return NextResponse.json(
        { error: "El gasto no existe en este evento" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se pueden editar gastos de un evento cerrado" },
        { status: 409 },
      );
    }

    const cantidadControl = cantidadCompra * factorConversion;
    const totalGastado = cantidadCompra * costoUnitario;

    if (cantidadControl < Number(gastoActual.cantidadLlevada)) {
      return NextResponse.json(
        {
          error: `La cantidad controlada no puede ser menor a las ${gastoActual.cantidadLlevada} unidades que ya fueron llevadas`,
        },
        { status: 400 },
      );
    }

    const gasto = await prisma.eventoGasto.update({
      where: {
        id: idGasto,
      },
      data: {
        grupo,
        gestionCompra,
        proveedor,
        item,
        cantidadCompra,
        unidadCompra,
        factorConversion,
        cantidadControl,
        unidadControl,
        costoUnitario,
        totalGastado,
        tipoControl: tipoControl as "SERVICIO" | "CONSUMIBLE" | "RETORNABLE",
        controlaStock: esServicio ? false : body.controlaStock !== false,
        fechaGasto: obtenerFechaGasto(body.fechaGasto),
        numeroDocumento: textoOpcional(body.numeroDocumento),
        observacion: textoOpcional(body.observacion),
      },
    });

    return NextResponse.json({
      mensaje: "Gasto actualizado correctamente",
      gasto,
    });
  } catch (error) {
    console.error("Error al actualizar el gasto del evento:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el gasto del evento" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const idEvento = obtenerId(idParam);
  const idGasto = obtenerId(req.nextUrl.searchParams.get("gastoId") || "");

  if (!idEvento || !idGasto) {
    return NextResponse.json(
      { error: "Los identificadores enviados no son válidos" },
      { status: 400 },
    );
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso?.puedeGestionar) {
      return NextResponse.json(
        {
          error:
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para actualizar controles.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const cantidadLlevada = numeroNoNegativo(body.cantidadLlevada);
    const cantidadUtilizada = numeroNoNegativo(body.cantidadUtilizada);
    const cantidadDevuelta = numeroNoNegativo(body.cantidadDevuelta);
    const cantidadDanada = numeroNoNegativo(body.cantidadDanada);
    const cantidadExtraviada = numeroNoNegativo(body.cantidadExtraviada);

    if (
      cantidadLlevada === null ||
      cantidadUtilizada === null ||
      cantidadDevuelta === null ||
      cantidadDanada === null ||
      cantidadExtraviada === null
    ) {
      return NextResponse.json(
        { error: "Las cantidades de control no pueden ser negativas" },
        { status: 400 },
      );
    }

    const [evento, gastoActual] = await Promise.all([
      prisma.evento.findUnique({
        where: {
          id: idEvento,
        },
        select: {
          id: true,
          estado: true,
        },
      }),
      prisma.eventoGasto.findFirst({
        where: {
          id: idGasto,
          idEvento,
        },
        select: {
          id: true,
          item: true,
          tipoControl: true,
          controlaStock: true,
          cantidadControl: true,
        },
      }),
    ]);

    if (!evento || !gastoActual) {
      return NextResponse.json(
        { error: "El gasto no existe en este evento" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se puede modificar el control de un evento cerrado" },
        { status: 409 },
      );
    }

    if (gastoActual.tipoControl === "SERVICIO" || !gastoActual.controlaStock) {
      return NextResponse.json(
        { error: "Este gasto no tiene control de unidades habilitado" },
        { status: 409 },
      );
    }

    const cantidadComprada = Number(gastoActual.cantidadControl);

    if (cantidadLlevada > cantidadComprada) {
      return NextResponse.json(
        {
          error: `No puedes llevar más de las ${gastoActual.cantidadControl} unidades disponibles`,
        },
        { status: 400 },
      );
    }

    const cantidadConDestino =
      cantidadUtilizada +
      cantidadDevuelta +
      cantidadDanada +
      cantidadExtraviada;

    if (cantidadConDestino > cantidadLlevada) {
      return NextResponse.json(
        {
          error:
            "La suma de utilizado, devuelto, dañado y extraviado no puede superar la cantidad llevada",
        },
        { status: 400 },
      );
    }

    const gasto = await prisma.eventoGasto.update({
      where: {
        id: gastoActual.id,
      },
      data: {
        cantidadLlevada,
        cantidadUtilizada,
        cantidadDevuelta,
        cantidadDanada,
        cantidadExtraviada,
      },
    });

    return NextResponse.json({
      mensaje: `Control de "${gastoActual.item}" actualizado correctamente`,
      gasto,
    });
  } catch (error) {
    console.error("Error al actualizar el control del gasto:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el control del producto" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const idEvento = obtenerId(idParam);
  const idGasto = obtenerId(req.nextUrl.searchParams.get("gastoId") || "");

  if (!idEvento || !idGasto) {
    return NextResponse.json(
      { error: "Los identificadores enviados no son válidos" },
      { status: 400 },
    );
  }

  try {
    const acceso = await obtenerAccesoEventos(session);

    if (!acceso?.puedeGestionar) {
      return NextResponse.json(
        {
          error:
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para eliminar gastos.",
        },
        { status: 403 },
      );
    }

    const [evento, gasto] = await Promise.all([
      prisma.evento.findUnique({
        where: {
          id: idEvento,
        },
        select: {
          id: true,
          estado: true,
        },
      }),
      prisma.eventoGasto.findFirst({
        where: {
          id: idGasto,
          idEvento,
        },
        select: {
          id: true,
          item: true,
          cantidadLlevada: true,
          cantidadUtilizada: true,
          cantidadDevuelta: true,
          cantidadDanada: true,
          cantidadExtraviada: true,
        },
      }),
    ]);

    if (!evento || !gasto) {
      return NextResponse.json(
        { error: "El gasto no existe en este evento" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se pueden eliminar gastos de un evento cerrado" },
        { status: 409 },
      );
    }

    const tieneControlRegistrado =
      Number(gasto.cantidadLlevada) > 0 ||
      Number(gasto.cantidadUtilizada) > 0 ||
      Number(gasto.cantidadDevuelta) > 0 ||
      Number(gasto.cantidadDanada) > 0 ||
      Number(gasto.cantidadExtraviada) > 0;

    if (tieneControlRegistrado) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un gasto que ya tiene movimientos de control. Primero deja sus cantidades en cero.",
        },
        { status: 409 },
      );
    }

    await prisma.eventoGasto.delete({
      where: {
        id: gasto.id,
      },
    });

    return NextResponse.json({
      mensaje: `Gasto "${gasto.item}" eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error al eliminar el gasto del evento:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el gasto del evento" },
      { status: 500 },
    );
  }
}