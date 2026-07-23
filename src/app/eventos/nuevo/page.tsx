"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Responsable = {
  id: number;
  usuario: string;
  tipoUsuario: {
    rol: string;
  };
};

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [cargandoResponsables, setCargandoResponsables] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    lugar: "",
    fechaInicio: "",
    fechaFin: "",
    idResponsable: "",
    estado: "PROXIMO",
  });

  useEffect(() => {
    async function cargarResponsables() {
      try {
        setCargandoResponsables(true);
        setErrorCatalogo("");

        const res = await fetch("/api/eventos?catalogos=1", {
          cache: "no-store",
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.error || "No se pudieron cargar los responsables",
          );
        }

        if (!json.permisos?.puedeGestionar) {
          toast.error(
            "Tu rol solo permite consultar eventos. Se requiere ADMIN u OPERADOR.",
          );
          router.replace("/eventos");
          return;
        }

        setResponsables(json.responsables || []);
      } catch (error) {
        setErrorCatalogo(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los responsables",
        );
      } finally {
        setCargandoResponsables(false);
      }
    }

    cargarResponsables();
  }, [router]);

  function actualizarCampo(campo: string, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardarEvento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formulario.nombre.trim()) {
      toast.error("Escribe el nombre del evento");
      return;
    }

    if (!formulario.fechaInicio) {
      toast.error("Selecciona la fecha de inicio");
      return;
    }

    const fechaInicio = new Date(formulario.fechaInicio);
    const fechaFin = formulario.fechaFin ? new Date(formulario.fechaFin) : null;

    if (fechaFin && fechaFin < fechaInicio) {
      toast.error("La fecha final no puede ser anterior a la fecha de inicio");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formulario,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin ? fechaFin.toISOString() : null,
          idResponsable: formulario.idResponsable
            ? Number(formulario.idResponsable)
            : null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo crear el evento");
      }

      toast.success("Evento creado correctamente");
      router.push("/eventos");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el evento",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <CalendarPlus className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                Inventario MKT
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Crear nuevo evento
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Registra la información general antes de asignar materiales.
              </p>
            </div>
          </div>

          <Link
            href="/eventos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </div>
      </section>

      <form onSubmit={guardarEvento}>
        <Card className="rounded-2xl border-red-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">
              Información del evento
            </CardTitle>

            <p className="text-sm text-slate-500">
              Los campos marcados con * son obligatorios.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor="nombre"
                  className="text-sm font-semibold text-slate-700"
                >
                  Nombre del evento *
                </label>

                <input
                  id="nombre"
                  value={formulario.nombre}
                  onChange={(event) =>
                    actualizarCampo("nombre", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Ej.: Feria FEXPOSIV 2026"
                  maxLength={150}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lugar"
                  className="text-sm font-semibold text-slate-700"
                >
                  Lugar
                </label>

                <input
                  id="lugar"
                  value={formulario.lugar}
                  onChange={(event) =>
                    actualizarCampo("lugar", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Ej.: Stand principal Monterrey"
                  maxLength={180}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="responsable"
                  className="text-sm font-semibold text-slate-700"
                >
                  Responsable
                </label>

                <select
                  id="responsable"
                  value={formulario.idResponsable}
                  onChange={(event) =>
                    actualizarCampo("idResponsable", event.target.value)
                  }
                  className={inputClassName}
                  disabled={cargandoResponsables}
                >
                  <option value="">
                    {cargandoResponsables
                      ? "Cargando responsables..."
                      : "Sin responsable asignado"}
                  </option>

                  {responsables.map((responsable) => (
                    <option key={responsable.id} value={responsable.id}>
                      {responsable.usuario} · {responsable.tipoUsuario.rol}
                    </option>
                  ))}
                </select>

                {errorCatalogo && (
                  <p className="text-xs text-red-600">{errorCatalogo}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="fechaInicio"
                  className="text-sm font-semibold text-slate-700"
                >
                  Fecha y hora de inicio *
                </label>

                <input
                  id="fechaInicio"
                  type="datetime-local"
                  value={formulario.fechaInicio}
                  onChange={(event) =>
                    actualizarCampo("fechaInicio", event.target.value)
                  }
                  className={inputClassName}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="fechaFin"
                  className="text-sm font-semibold text-slate-700"
                >
                  Fecha y hora de finalización
                </label>

                <input
                  id="fechaFin"
                  type="datetime-local"
                  value={formulario.fechaFin}
                  onChange={(event) =>
                    actualizarCampo("fechaFin", event.target.value)
                  }
                  className={inputClassName}
                  min={formulario.fechaInicio || undefined}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="estado"
                  className="text-sm font-semibold text-slate-700"
                >
                  Estado inicial
                </label>

                <select
                  id="estado"
                  value={formulario.estado}
                  onChange={(event) =>
                    actualizarCampo("estado", event.target.value)
                  }
                  className={inputClassName}
                >
                  <option value="PROXIMO">Próximo</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-semibold text-slate-700"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={(event) =>
                    actualizarCampo("descripcion", event.target.value)
                  }
                  className="min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder="Describe el propósito del evento y cualquier información importante."
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/eventos"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {guardando ? "Guardando..." : "Guardar evento"}
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}