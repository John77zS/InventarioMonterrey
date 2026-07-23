"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  Printer,
  RefreshCw,
} from "lucide-react";

type EstadoEvento = "PROXIMO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO";
type TipoUsoEvento = "CONSUMIBLE" | "RETORNABLE";
type TipoControlGasto = "SERVICIO" | "CONSUMIBLE" | "RETORNABLE";
type EstadoGastoEvento =
  | "REGISTRADO"
  | "APROBADO"
  | "COMPRADO"
  | "RECIBIDO"
  | "PAGADO"
  | "CANCELADO";

type MaterialEvento = {
  id: number;
  tipoUso: TipoUsoEvento;
  cantidadAsignada: number;
  cantidadEntregada: number;
  cantidadConsumida: number;
  cantidadDevuelta: number;
  cantidadDanada: number;
  cantidadExtraviada: number;
  observacion: string | null;
  producto: {
    id: number;
    codigo: string | null;
    nombreProducto: string;
    unidadMedida: string;
    ubicacion: string | null;
    stock: number;
  };
};

type GastoEvento = {
  id: number;
  grupo: string;
  gestionCompra: string;
  proveedor: string;
  item: string;
  cantidadCompra: number | string;
  unidadCompra: string;
  factorConversion: number | string;
  cantidadControl: number | string;
  unidadControl: string;
  costoUnitario: number | string;
  totalGastado: number | string;
  cantidadLlevada: number | string;
  cantidadUtilizada: number | string;
  cantidadDevuelta: number | string;
  cantidadDanada: number | string;
  cantidadExtraviada: number | string;
  tipoControl: TipoControlGasto;
  controlaStock: boolean;
  estado: EstadoGastoEvento;
  fechaGasto: string;
  numeroDocumento: string | null;
  observacion: string | null;
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
  materiales: MaterialEvento[];
  gastos: GastoEvento[];
};

const etiquetaEstadoEvento: Record<EstadoEvento, string> = {
  PROXIMO: "Próximo",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const etiquetaEstadoGasto: Record<EstadoGastoEvento, string> = {
  REGISTRADO: "Registrado",
  APROBADO: "Aprobado",
  COMPRADO: "Comprado",
  RECIBIDO: "Recibido",
  PAGADO: "Pagado",
  CANCELADO: "Cancelado",
};

function numero(valor: number | string) {
  return Number(valor || 0);
}

function formatearMoneda(valor: number | string) {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero(valor))}`;
}

function formatearCantidad(valor: number | string) {
  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 2,
  }).format(numero(valor));
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "America/La_Paz",
  }).format(new Date(fecha));
}

function nombreArchivo(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function escaparCSV(valor: unknown) {
  let texto = String(valor ?? "");

  if (/^[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

function numeroCSV(valor: number | string) {
  return numero(valor).toFixed(2).replace(".", ",");
}

function descargarCSV(nombre: string, filas: unknown[][]) {
  const contenido = filas
    .map((fila) => fila.map(escaparCSV).join(";"))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", contenido], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export default function EventoReportePage() {
  const params = useParams<{ id: string }>();
  const idEvento = params.id;
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarReporte = useCallback(async () => {
    if (!idEvento) return;

    try {
      setCargando(true);
      setError("");

      const res = await fetch(`/api/eventos/${idEvento}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo cargar el reporte");
      }

      setEvento(json.evento);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo cargar el reporte",
      );
    } finally {
      setCargando(false);
    }
  }, [idEvento]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const resumen = useMemo(() => {
    const gastos = evento?.gastos || [];
    const materiales = evento?.materiales || [];
    const gastosVigentes = gastos.filter(
      (gasto) => gasto.estado !== "CANCELADO",
    );

    return {
      totalGastado: gastosVigentes.reduce(
        (total, gasto) => total + numero(gasto.totalGastado),
        0,
      ),
      gastosRegistrados: gastos.length,
      referenciasMateriales: materiales.length,
      planificado: materiales.reduce(
        (total, material) => total + material.cantidadAsignada,
        0,
      ),
      llevado: materiales.reduce(
        (total, material) => total + material.cantidadEntregada,
        0,
      ),
      utilizado: materiales.reduce(
        (total, material) => total + material.cantidadConsumida,
        0,
      ),
      devuelto: materiales.reduce(
        (total, material) => total + material.cantidadDevuelta,
        0,
      ),
      incidencias: materiales.reduce(
        (total, material) =>
          total + material.cantidadDanada + material.cantidadExtraviada,
        0,
      ),
      saldoEvento: materiales.reduce(
        (total, material) =>
          total +
          Math.max(
            0,
            material.cantidadEntregada -
              material.cantidadConsumida -
              material.cantidadDevuelta -
              material.cantidadDanada -
              material.cantidadExtraviada,
          ),
        0,
      ),
    };
  }, [evento]);

  const gastosPorGrupo = useMemo(() => {
    const grupos = new Map<string, { registros: number; total: number }>();

    for (const gasto of evento?.gastos || []) {
      if (gasto.estado === "CANCELADO") continue;

      const actual = grupos.get(gasto.grupo) || { registros: 0, total: 0 };
      actual.registros += 1;
      actual.total += numero(gasto.totalGastado);
      grupos.set(gasto.grupo, actual);
    }

    return Array.from(grupos.entries())
      .map(([grupo, datos]) => ({ grupo, ...datos }))
      .sort((a, b) => b.total - a.total);
  }, [evento]);

  function descargarGastos() {
    if (!evento) return;

    const filas: unknown[][] = [
      [
        "Grupo",
        "Gestión de compra",
        "Proveedor",
        "Ítem",
        "Cantidad comprada",
        "Unidad de compra",
        "Contenido por compra",
        "Cantidad controlada",
        "Unidad controlada",
        "Costo unitario Bs",
        "Total gastado Bs",
        "Tipo",
        "Llevado",
        "Utilizado",
        "Devuelto",
        "Dañado",
        "Extraviado",
        "Estado",
        "Fecha",
        "Documento",
        "Observación",
      ],
      ...evento.gastos.map((gasto) => [
        gasto.grupo,
        gasto.gestionCompra,
        gasto.proveedor,
        gasto.item,
        numeroCSV(gasto.cantidadCompra),
        gasto.unidadCompra,
        numeroCSV(gasto.factorConversion),
        numeroCSV(gasto.cantidadControl),
        gasto.unidadControl,
        numeroCSV(gasto.costoUnitario),
        numeroCSV(gasto.totalGastado),
        gasto.tipoControl,
        numeroCSV(gasto.cantidadLlevada),
        numeroCSV(gasto.cantidadUtilizada),
        numeroCSV(gasto.cantidadDevuelta),
        numeroCSV(gasto.cantidadDanada),
        numeroCSV(gasto.cantidadExtraviada),
        etiquetaEstadoGasto[gasto.estado],
        formatearFecha(gasto.fechaGasto),
        gasto.numeroDocumento || "",
        gasto.observacion || "",
      ]),
    ];

    descargarCSV(`gastos-${nombreArchivo(evento.nombre)}.csv`, filas);
  }

  function descargarMateriales() {
    if (!evento) return;

    const filas: unknown[][] = [
      [
        "Código",
        "Material",
        "Tipo de uso",
        "Unidad",
        "Ubicación",
        "Planificado",
        "Llevado",
        "Regalado/utilizado",
        "Devuelto",
        "Dañado",
        "Extraviado",
        "Saldo en evento",
        "Stock general actual",
        "Observación",
      ],
      ...evento.materiales.map((material) => {
        const saldo = Math.max(
          0,
          material.cantidadEntregada -
            material.cantidadConsumida -
            material.cantidadDevuelta -
            material.cantidadDanada -
            material.cantidadExtraviada,
        );

        return [
          material.producto.codigo || "",
          material.producto.nombreProducto,
          material.tipoUso === "CONSUMIBLE" ? "Consumible" : "Retornable",
          material.producto.unidadMedida,
          material.producto.ubicacion || "",
          material.cantidadAsignada,
          material.cantidadEntregada,
          material.cantidadConsumida,
          material.cantidadDevuelta,
          material.cantidadDanada,
          material.cantidadExtraviada,
          saldo,
          material.producto.stock,
          material.observacion || "",
        ];
      }),
    ];

    descargarCSV(`materiales-${nombreArchivo(evento.nombre)}.csv`, filas);
  }

  if (cargando && !evento) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Generando reporte...
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-red-700">
          {error || "No se encontró el evento"}
        </p>
        <button
          type="button"
          onClick={cargarReporte}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/eventos/${evento.id}`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al evento
          </Link>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={descargarGastos}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Gastos CSV
            </button>

            <button
              type="button"
              onClick={descargarMateriales}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4" />
              Materiales CSV
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Guardar PDF
            </button>
          </div>
        </nav>

        <article className="space-y-7 bg-white p-6 shadow-sm print:p-0 print:shadow-none">
          <header className="border-b-4 border-red-600 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
                  Inventario MKT · Reporte de evento
                </p>
                <h1 className="mt-2 text-3xl font-black">{evento.nombre}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {formatearFecha(evento.fechaInicio)}
                  {evento.fechaFin
                    ? ` — ${formatearFecha(evento.fechaFin)}`
                    : ""}
                  {evento.lugar ? ` · ${evento.lugar}` : ""}
                </p>
              </div>

              <div className="text-left text-sm sm:text-right">
                <p className="font-bold text-slate-800">
                  Estado: {etiquetaEstadoEvento[evento.estado]}
                </p>
                <p className="mt-1 text-slate-500">
                  Responsable: {evento.responsable?.usuario || "Sin asignar"}
                </p>
                <p className="mt-1 text-slate-500">
                  Generado: {formatearFecha(new Date().toISOString())}
                </p>
              </div>
            </div>

            {evento.descripcion && (
              <p className="mt-4 max-w-4xl text-sm text-slate-600">
                {evento.descripcion}
              </p>
            )}
          </header>

          <section>
            <h2 className="text-lg font-black">Resumen general</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-9">
              {[
                ["Total gastado", formatearMoneda(resumen.totalGastado)],
                ["Gastos", resumen.gastosRegistrados],
                ["Materiales", resumen.referenciasMateriales],
                ["Planificado", resumen.planificado],
                ["Llevado", resumen.llevado],
                ["Utilizado", resumen.utilizado],
                ["Devuelto", resumen.devuelto],
                ["Incidencias", resumen.incidencias],
                ["Saldo evento", resumen.saldoEvento],
              ].map(([etiqueta, valor]) => (
                <div
                  key={String(etiqueta)}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {etiqueta}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">
                    {valor}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-black">Gastos por grupo</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Grupo</th>
                    <th className="px-4 py-3 text-right">Registros</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gastosPorGrupo.map((grupo) => (
                    <tr key={grupo.grupo}>
                      <td className="px-4 py-3 font-semibold">{grupo.grupo}</td>
                      <td className="px-4 py-3 text-right">
                        {grupo.registros}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatearMoneda(grupo.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50 font-black text-red-700">
                  <tr>
                    <td className="px-4 py-3">Total acumulado</td>
                    <td className="px-4 py-3 text-right">
                      {gastosPorGrupo.reduce(
                        (total, grupo) => total + grupo.registros,
                        0,
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatearMoneda(resumen.totalGastado)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black">Detalle de gastos</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full table-fixed text-left text-[10px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="w-[17%] px-2 py-2">Grupo</th>
                    <th className="w-[22%] px-2 py-2">Ítem</th>
                    <th className="w-[13%] px-2 py-2">Proveedor</th>
                    <th className="w-[10%] px-2 py-2 text-right">Compra</th>
                    <th className="w-[11%] px-2 py-2 text-right">Control</th>
                    <th className="w-[11%] px-2 py-2 text-right">Costo</th>
                    <th className="w-[11%] px-2 py-2 text-right">Total</th>
                    <th className="w-[10%] px-2 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evento.gastos.map((gasto) => (
                    <tr key={gasto.id} className="break-inside-avoid">
                      <td className="px-2 py-2 align-top">{gasto.grupo}</td>
                      <td className="px-2 py-2 align-top font-semibold">
                        {gasto.item}
                      </td>
                      <td className="px-2 py-2 align-top">{gasto.proveedor}</td>
                      <td className="px-2 py-2 text-right align-top">
                        {formatearCantidad(gasto.cantidadCompra)}{" "}
                        {gasto.unidadCompra}
                      </td>
                      <td className="px-2 py-2 text-right align-top">
                        {gasto.controlaStock
                          ? `${formatearCantidad(gasto.cantidadControl)} ${gasto.unidadControl}`
                          : "No aplica"}
                      </td>
                      <td className="px-2 py-2 text-right align-top">
                        {formatearMoneda(gasto.costoUnitario)}
                      </td>
                      <td className="px-2 py-2 text-right align-top font-bold">
                        {formatearMoneda(gasto.totalGastado)}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {etiquetaEstadoGasto[gasto.estado]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black">
              Control de productos comprados para el evento
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full table-fixed text-left text-[10px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="w-[28%] px-2 py-2">Producto</th>
                    <th className="px-2 py-2 text-right">Comprado</th>
                    <th className="px-2 py-2 text-right">Llevado</th>
                    <th className="px-2 py-2 text-right">Utilizado</th>
                    <th className="px-2 py-2 text-right">Devuelto</th>
                    <th className="px-2 py-2 text-right">Dañado</th>
                    <th className="px-2 py-2 text-right">Extraviado</th>
                    <th className="px-2 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evento.gastos
                    .filter((gasto) => gasto.controlaStock)
                    .map((gasto) => {
                      const saldo = Math.max(
                        0,
                        numero(gasto.cantidadLlevada) -
                          numero(gasto.cantidadUtilizada) -
                          numero(gasto.cantidadDevuelta) -
                          numero(gasto.cantidadDanada) -
                          numero(gasto.cantidadExtraviada),
                      );

                      return (
                        <tr key={gasto.id} className="break-inside-avoid">
                          <td className="px-2 py-2 font-semibold">
                            {gasto.item}
                            <span className="ml-1 font-normal text-slate-400">
                              ({gasto.unidadControl})
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadControl)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadLlevada)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadUtilizada)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadDevuelta)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadDanada)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {formatearCantidad(gasto.cantidadExtraviada)}
                          </td>
                          <td className="px-2 py-2 text-right font-bold">
                            {formatearCantidad(saldo)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black">
              Materiales del inventario general
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full table-fixed text-left text-[10px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="w-[26%] px-2 py-2">Material</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2 text-right">Planificado</th>
                    <th className="px-2 py-2 text-right">Llevado</th>
                    <th className="px-2 py-2 text-right">Utilizado</th>
                    <th className="px-2 py-2 text-right">Devuelto</th>
                    <th className="px-2 py-2 text-right">Dañado</th>
                    <th className="px-2 py-2 text-right">Extraviado</th>
                    <th className="px-2 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evento.materiales.map((material) => {
                    const saldo = Math.max(
                      0,
                      material.cantidadEntregada -
                        material.cantidadConsumida -
                        material.cantidadDevuelta -
                        material.cantidadDanada -
                        material.cantidadExtraviada,
                    );

                    return (
                      <tr key={material.id} className="break-inside-avoid">
                        <td className="px-2 py-2 font-semibold">
                          {material.producto.nombreProducto}
                        </td>
                        <td className="px-2 py-2">
                          {material.tipoUso === "CONSUMIBLE"
                            ? "Consumible"
                            : "Retornable"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadAsignada}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadEntregada}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadConsumida}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadDevuelta}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadDanada}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {material.cantidadExtraviada}
                        </td>
                        <td className="px-2 py-2 text-right font-bold">
                          {saldo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            Reporte generado desde Inventario MKT. Los montos corresponden a
            gastos acumulados y no representan un presupuesto límite.
          </footer>
        </article>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </main>
  );
}