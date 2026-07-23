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

class ErrorMovimiento extends Error {
  status: number;

  constructor(mensaje: string, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

const TIPOS_USO = new Set(["CONSUMIBLE", "RETORNABLE"]);

function obtenerId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function enteroNoNegativo(valor: unknown) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
}

function textoOpcional(valor: unknown) {
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

async function obtenerEventoEditable(idEvento: number) {
  return prisma.evento.findUnique({
    where: {
      id: idEvento,
    },
    select: {
      id: true,
      estado: true,
    },
  });
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
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para modificar materiales.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const idProducto = Number(body.idProducto);
    const cantidadAsignada = Number(body.cantidadAsignada);
    const tipoUso =
      typeof body.tipoUso === "string" && TIPOS_USO.has(body.tipoUso)
        ? body.tipoUso
        : "CONSUMIBLE";
    const observacion = textoOpcional(body.observacion);

    if (!Number.isInteger(idProducto) || idProducto <= 0) {
      return NextResponse.json(
        { error: "Selecciona un material válido" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(cantidadAsignada) || cantidadAsignada <= 0) {
      return NextResponse.json(
        { error: "La cantidad planificada debe ser mayor a cero" },
        { status: 400 },
      );
    }

    const [evento, producto, materialActual] = await Promise.all([
      obtenerEventoEditable(idEvento),
      prisma.producto.findFirst({
        where: {
          id: idProducto,
          estado: "ACTIVO",
        },
        select: {
          id: true,
          nombreProducto: true,
          stock: true,
        },
      }),
      prisma.eventoMaterial.findUnique({
        where: {
          idEvento_idProducto: {
            idEvento,
            idProducto,
          },
        },
        select: {
          id: true,
          cantidadEntregada: true,
        },
      }),
    ]);

    if (!evento) {
      return NextResponse.json(
        { error: "El evento no existe" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se pueden modificar materiales de un evento cerrado" },
        { status: 409 },
      );
    }

    if (!producto) {
      return NextResponse.json(
        { error: "El material seleccionado no está disponible" },
        { status: 404 },
      );
    }

    const cantidadYaEntregada = Number(materialActual?.cantidadEntregada || 0);

    if (cantidadAsignada < cantidadYaEntregada) {
      return NextResponse.json(
        {
          error: `La cantidad planificada no puede ser menor a las ${cantidadYaEntregada} unidades ya despachadas`,
        },
        { status: 400 },
      );
    }

    const cantidadPendiente = cantidadAsignada - cantidadYaEntregada;

    if (cantidadPendiente > Number(producto.stock || 0)) {
      return NextResponse.json(
        {
          error: `Stock insuficiente. Hay ${producto.stock} unidades disponibles de ${producto.nombreProducto}`,
        },
        { status: 400 },
      );
    }

    const material = await prisma.eventoMaterial.upsert({
      where: {
        idEvento_idProducto: {
          idEvento,
          idProducto,
        },
      },
      create: {
        idEvento,
        idProducto,
        tipoUso: tipoUso as "CONSUMIBLE" | "RETORNABLE",
        cantidadAsignada,
        observacion,
      },
      update: {
        tipoUso: tipoUso as "CONSUMIBLE" | "RETORNABLE",
        cantidadAsignada,
        observacion,
      },
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
    });

    return NextResponse.json(
      {
        mensaje: materialActual
          ? "Material actualizado correctamente"
          : "Material agregado correctamente",
        material,
      },
      { status: materialActual ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error al guardar material del evento:", error);

    return NextResponse.json(
      { error: "No se pudo guardar el material del evento" },
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
  const idMaterial = obtenerId(
    req.nextUrl.searchParams.get("materialId") || "",
  );

  if (!idEvento || !idMaterial) {
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
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para registrar movimientos.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const cantidadDespachar = enteroNoNegativo(body.cantidadDespachar);
    const cantidadConsumida = enteroNoNegativo(body.cantidadConsumida);
    const cantidadDevuelta = enteroNoNegativo(body.cantidadDevuelta);
    const cantidadDanada = enteroNoNegativo(body.cantidadDanada);
    const cantidadExtraviada = enteroNoNegativo(body.cantidadExtraviada);

    if (
      cantidadDespachar === null ||
      cantidadConsumida === null ||
      cantidadDevuelta === null ||
      cantidadDanada === null ||
      cantidadExtraviada === null
    ) {
      return NextResponse.json(
        { error: "Las cantidades deben ser números enteros no negativos" },
        { status: 400 },
      );
    }

    const totalMovimiento =
      cantidadDespachar +
      cantidadConsumida +
      cantidadDevuelta +
      cantidadDanada +
      cantidadExtraviada;

    if (totalMovimiento === 0) {
      return NextResponse.json(
        { error: "Ingresa al menos una cantidad para registrar" },
        { status: 400 },
      );
    }

    const materialActualizado = await prisma.$transaction(async (tx) => {
      const [evento, material] = await Promise.all([
        tx.evento.findUnique({
          where: {
            id: idEvento,
          },
          select: {
            id: true,
            nombre: true,
            estado: true,
          },
        }),
        tx.eventoMaterial.findFirst({
          where: {
            id: idMaterial,
            idEvento,
          },
          include: {
            producto: {
              select: {
                id: true,
                nombreProducto: true,
                stock: true,
              },
            },
          },
        }),
      ]);

      if (!evento || !material) {
        throw new ErrorMovimiento("El material asignado no existe", 404);
      }

      if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
        throw new ErrorMovimiento(
          "No se pueden registrar movimientos en un evento cerrado",
          409,
        );
      }

      const pendientePorDespachar =
        material.cantidadAsignada - material.cantidadEntregada;

      if (cantidadDespachar > pendientePorDespachar) {
        throw new ErrorMovimiento(
          `Solo quedan ${pendientePorDespachar} unidades pendientes por despachar`,
        );
      }

      if (cantidadDespachar > material.producto.stock) {
        throw new ErrorMovimiento(
          `Stock insuficiente. Hay ${material.producto.stock} unidades disponibles`,
        );
      }

      const saldoActualEvento =
        material.cantidadEntregada -
        material.cantidadConsumida -
        material.cantidadDevuelta -
        material.cantidadDanada -
        material.cantidadExtraviada;
      const disponibleEnEvento = saldoActualEvento + cantidadDespachar;
      const salidasDelEvento =
        cantidadConsumida +
        cantidadDevuelta +
        cantidadDanada +
        cantidadExtraviada;

      if (salidasDelEvento > disponibleEnEvento) {
        throw new ErrorMovimiento(
          `Solo hay ${disponibleEnEvento} unidades disponibles en el evento para registrar`,
        );
      }

      if (cantidadDespachar > 0) {
        const productoActualizado = await tx.producto.updateMany({
          where: {
            id: material.idProducto,
            stock: {
              gte: cantidadDespachar,
            },
          },
          data: {
            stock: {
              decrement: cantidadDespachar,
            },
          },
        });

        if (productoActualizado.count !== 1) {
          throw new ErrorMovimiento(
            "El stock cambió mientras se registraba el despacho. Actualiza la página e inténtalo nuevamente.",
            409,
          );
        }

        await tx.movimientoInventario.create({
          data: {
            idProducto: material.idProducto,
            idUsuario: acceso.idUsuario,
            idEvento,
            tipo: "SALIDA",
            origen: "ASIGNACION_EVENTO",
            cantidad: cantidadDespachar,
            descripcion: `Despacho de ${cantidadDespachar} unidades de ${material.producto.nombreProducto} al evento ${evento.nombre}`,
          },
        });
      }

      if (cantidadDevuelta > 0) {
        await tx.producto.update({
          where: {
            id: material.idProducto,
          },
          data: {
            stock: {
              increment: cantidadDevuelta,
            },
          },
        });

        await tx.movimientoInventario.create({
          data: {
            idProducto: material.idProducto,
            idUsuario: acceso.idUsuario,
            idEvento,
            tipo: "ENTRADA",
            origen: "DEVOLUCION_EVENTO",
            cantidad: cantidadDevuelta,
            descripcion: `Devolución de ${cantidadDevuelta} unidades de ${material.producto.nombreProducto} desde el evento ${evento.nombre}`,
          },
        });
      }

      return tx.eventoMaterial.update({
        where: {
          id: material.id,
        },
        data: {
          cantidadEntregada: {
            increment: cantidadDespachar,
          },
          cantidadConsumida: {
            increment: cantidadConsumida,
          },
          cantidadDevuelta: {
            increment: cantidadDevuelta,
          },
          cantidadDanada: {
            increment: cantidadDanada,
          },
          cantidadExtraviada: {
            increment: cantidadExtraviada,
          },
        },
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
      });
    });

    return NextResponse.json({
      mensaje: "Movimientos del material registrados correctamente",
      material: materialActualizado,
    });
  } catch (error) {
    if (error instanceof ErrorMovimiento) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Error al registrar movimientos del material:", error);

    return NextResponse.json(
      { error: "No se pudieron registrar los movimientos del material" },
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
  const idMaterial = obtenerId(
    req.nextUrl.searchParams.get("materialId") || "",
  );

  if (!idEvento || !idMaterial) {
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
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR para eliminar materiales.",
        },
        { status: 403 },
      );
    }

    const [evento, material] = await Promise.all([
      obtenerEventoEditable(idEvento),
      prisma.eventoMaterial.findFirst({
        where: {
          id: idMaterial,
          idEvento,
        },
      }),
    ]);

    if (!evento || !material) {
      return NextResponse.json(
        { error: "El material asignado no existe" },
        { status: 404 },
      );
    }

    if (evento.estado === "FINALIZADO" || evento.estado === "CANCELADO") {
      return NextResponse.json(
        { error: "No se pueden modificar materiales de un evento cerrado" },
        { status: 409 },
      );
    }

    const tieneMovimientos =
      material.cantidadEntregada > 0 ||
      material.cantidadConsumida > 0 ||
      material.cantidadDevuelta > 0 ||
      material.cantidadDanada > 0 ||
      material.cantidadExtraviada > 0;

    if (tieneMovimientos) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un material que ya tiene entregas o movimientos registrados",
        },
        { status: 409 },
      );
    }

    await prisma.eventoMaterial.delete({
      where: {
        id: material.id,
      },
    });

    return NextResponse.json({
      mensaje: "Material eliminado del evento",
    });
  } catch (error) {
    console.error("Error al eliminar material del evento:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el material del evento" },
      { status: 500 },
    );
  }
}