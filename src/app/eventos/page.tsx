"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CirclePlay,
  Clock3,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EstadoEvento = "PROXIMO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO";

type PermisosEventos = {
  rol: "ADMIN" | "VENDEDOR" | "OPERADOR" | "CONSULTA";
  puedeGestionar: boolean;
  soloLectura: boolean;
};

type Evento = {
  id: number;
  nombre: string;
  descripcion: string | null;
  lugar: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  estado: EstadoEvento;
  responsable: {
    id: number;
    usuario: string;
  } | null;
  creadoPor: {
    id: number;
    usuario: string;
  };
  _count: {
    materiales: number;
  };
};

const estadoConfig: Record<
  EstadoEvento,
  { etiqueta: string; className: string }
> = {
  PROXIMO: {
    etiqueta: "Próximo",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  EN_CURSO: {
    etiqueta: "En curso",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  FINALIZADO: {
    etiqueta: "Finalizado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELADO: {
    etiqueta: "Cancelado",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(new Date(fecha));
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [permisos, setPermisos] = useState<PermisosEventos | null>(null);

  const cargarEventos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const res = await fetch("/api/eventos", {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudieron cargar los eventos");
      }

      setEventos(json.eventos || []);
      setPermisos(json.permisos || null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los eventos",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const resumen = useMemo(
    () => ({
      total: eventos.length,
      proximos: eventos.filter((evento) => evento.estado === "PROXIMO").length,
      enCurso: eventos.filter((evento) => evento.estado === "EN_CURSO").length,
      finalizados: eventos.filter((evento) => evento.estado === "FINALIZADO")
        .length,
    }),
    [eventos],
  );

  const tarjetasResumen = [
    {
      titulo: "Total eventos",
      valor: resumen.total,
      descripcion: "Eventos registrados",
      icono: CalendarDays,
      color: "text-slate-700",
      fondo: "bg-slate-100",
    },
    {
      titulo: "Próximos",
      valor: resumen.proximos,
      descripcion: "Pendientes de iniciar",
      icono: Clock3,
      color: "text-amber-700",
      fondo: "bg-amber-50",
    },
    {
      titulo: "En curso",
      valor: resumen.enCurso,
      descripcion: "Actualmente activos",
      icono: CirclePlay,
      color: "text-red-700",
      fondo: "bg-red-50",
    },
    {
      titulo: "Finalizados",
      valor: resumen.finalizados,
      descripcion: "Con inventario cerrado",
      icono: CircleCheck,
      color: "text-emerald-700",
      fondo: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Gestión de eventos
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Organiza cada evento y controla los materiales asignados.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>

            <button
              type="button"
              onClick={cargarEventos}
              disabled={cargando}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>

            {permisos?.puedeGestionar && (
              <Link
                href="/eventos/nuevo"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Nuevo evento
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetasResumen.map((item) => {
          const Icono = item.icono;

          return (
            <Card
              key={item.titulo}
              className="overflow-hidden rounded-2xl border-red-100 bg-white shadow-sm"
            >
              <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-300" />

              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {item.titulo}
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {cargando ? "—" : item.valor}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${item.fondo} ${item.color}`}>
                    <Icono className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border-red-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Eventos registrados
          </CardTitle>

          <p className="text-sm text-slate-500">
            Información sincronizada con la base de datos.
          </p>
        </CardHeader>

        <CardContent>
          {cargando ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Cargando eventos...
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 px-6 text-center">
              <p className="font-semibold text-red-700">{error}</p>

              <button
                type="button"
                onClick={cargarEventos}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar nuevamente
              </button>
            </div>
          ) : eventos.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 px-6 text-center">
              <div className="rounded-full bg-white p-4 text-red-600 shadow-sm">
                <CalendarDays className="h-8 w-8" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Todavía no hay eventos registrados
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Crea el primer evento para comenzar a asignar materiales y
                controlar sus entregas y devoluciones.
              </p>

              {permisos?.puedeGestionar ? (
                <Link
                  href="/eventos/nuevo"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Crear primer evento
                </Link>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                  Tu rol {permisos?.rol || ""} tiene acceso de solo lectura.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {eventos.map((evento) => {
                const config = estadoConfig[evento.estado];

                return (
                  <article
                    key={evento.id}
                    className="rounded-2xl border border-slate-200 p-5 transition-colors hover:border-red-200 hover:bg-red-50/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-bold text-slate-900">
                          {evento.nombre}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatearFecha(evento.fechaInicio)}
                          {evento.fechaFin
                            ? ` — ${formatearFecha(evento.fechaFin)}`
                            : ""}
                        </p>
                      </div>

                      <Badge variant="outline" className={config.className}>
                        {config.etiqueta}
                      </Badge>
                    </div>

                    {evento.descripcion && (
                      <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                        {evento.descripcion}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="truncate">
                          {evento.lugar || "Sin lugar"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-red-500" />
                        <span className="truncate">
                          {evento.responsable?.usuario || "Sin responsable"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-red-500" />
                        <span>
                          {evento._count.materiales} material
                          {evento._count.materiales === 1 ? "" : "es"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                      <Link
                        href={`/eventos/${evento.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-red-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        {permisos?.puedeGestionar
                          ? "Gestionar evento"
                          : "Ver evento"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}