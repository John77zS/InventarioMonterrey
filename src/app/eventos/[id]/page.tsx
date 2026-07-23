"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
  Gift,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type PermisosEventos = {
  rol: "ADMIN" | "VENDEDOR" | "OPERADOR" | "CONSULTA";
  puedeGestionar: boolean;
  soloLectura: boolean;
};

type Producto = {
  id: number;
  codigo: string | null;
  nombreProducto: string;
  unidadMedida: string;
  ubicacion: string | null;
  stock: number;
  stockMinimo: number;
};

type MaterialEvento = {
  id: number;
  idProducto: number;
  tipoUso: TipoUsoEvento;
  cantidadAsignada: number;
  cantidadEntregada: number;
  cantidadConsumida: number;
  cantidadDevuelta: number;
  cantidadDanada: number;
  cantidadExtraviada: number;
  observacion: string | null;
  producto: Producto;
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

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

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

function formatearMoneda(valor: number | string) {
  return `Bs ${new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor || 0))}`;
}

function formatearCantidad(valor: number | string) {
  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function obtenerFechaHoy() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
  }).format(new Date());
}

function fechaParaInput(fecha: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
  }).format(new Date(fecha));
}

function crearFormularioGastoInicial() {
  return {
    grupo: "",
    gestionCompra: "Compras",
    proveedor: "",
    item: "",
    cantidadCompra: "",
    unidadCompra: "un",
    factorConversion: "1",
    unidadControl: "unidad",
    costoUnitario: "",
    tipoControl: "CONSUMIBLE" as TipoControlGasto,
    controlaStock: true,
    fechaGasto: obtenerFechaHoy(),
    numeroDocumento: "",
    observacion: "",
  };
}

const estadoGastoConfig: Record<
  EstadoGastoEvento,
  { etiqueta: string; className: string }
> = {
  REGISTRADO: {
    etiqueta: "Registrado",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  APROBADO: {
    etiqueta: "Aprobado",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  COMPRADO: {
    etiqueta: "Comprado",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  RECIBIDO: {
    etiqueta: "Recibido",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  PAGADO: {
    etiqueta: "Pagado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELADO: {
    etiqueta: "Cancelado",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export default function EventoDetallePage() {
  const params = useParams<{ id: string }>();
  const idEvento = params.id;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoMovimientoMaterial, setGuardandoMovimientoMaterial] =
    useState(false);
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [guardandoControl, setGuardandoControl] = useState(false);
  const [mostrarFormularioGasto, setMostrarFormularioGasto] = useState(false);
  const [gastoEnControl, setGastoEnControl] = useState<GastoEvento | null>(
    null,
  );
  const [materialEnControl, setMaterialEnControl] =
    useState<MaterialEvento | null>(null);
  const [editandoGastoId, setEditandoGastoId] = useState<number | null>(null);
  const [eliminandoGastoId, setEliminandoGastoId] = useState<number | null>(
    null,
  );
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [permisos, setPermisos] = useState<PermisosEventos | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<"materiales" | "gastos">(
    "gastos",
  );
  const [formulario, setFormulario] = useState({
    idProducto: "",
    tipoUso: "CONSUMIBLE" as TipoUsoEvento,
    cantidadAsignada: "",
    observacion: "",
  });
  const [formularioGasto, setFormularioGasto] = useState(
    crearFormularioGastoInicial,
  );
  const [formularioControl, setFormularioControl] = useState({
    cantidadLlevada: "0",
    cantidadUtilizada: "0",
    cantidadDevuelta: "0",
    cantidadDanada: "0",
    cantidadExtraviada: "0",
  });
  const [formularioMovimientoMaterial, setFormularioMovimientoMaterial] =
    useState({
      cantidadDespachar: "0",
      cantidadConsumida: "0",
      cantidadDevuelta: "0",
      cantidadDanada: "0",
      cantidadExtraviada: "0",
    });

  const cargarDetalle = useCallback(async () => {
    if (!idEvento) return;

    try {
      setCargando(true);
      setError("");

      const res = await fetch(`/api/eventos/${idEvento}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo cargar el evento");
      }

      setEvento(json.evento);
      setProductos(json.productos || []);
      setPermisos(json.permisos || null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo cargar el evento",
      );
    } finally {
      setCargando(false);
    }
  }, [idEvento]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  const resumen = useMemo(() => {
    const materiales = evento?.materiales || [];

    return {
      referencias: materiales.length,
      unidadesPlanificadas: materiales.reduce(
        (total, material) => total + material.cantidadAsignada,
        0,
      ),
      consumibles: materiales.filter(
        (material) => material.tipoUso === "CONSUMIBLE",
      ).length,
      retornables: materiales.filter(
        (material) => material.tipoUso === "RETORNABLE",
      ).length,
    };
  }, [evento]);

  const calculoMovimientoMaterial = useMemo(() => {
    const cantidadDespachar = Number(
      formularioMovimientoMaterial.cantidadDespachar || 0,
    );
    const cantidadConsumida = Number(
      formularioMovimientoMaterial.cantidadConsumida || 0,
    );
    const cantidadDevuelta = Number(
      formularioMovimientoMaterial.cantidadDevuelta || 0,
    );
    const cantidadDanada = Number(
      formularioMovimientoMaterial.cantidadDanada || 0,
    );
    const cantidadExtraviada = Number(
      formularioMovimientoMaterial.cantidadExtraviada || 0,
    );
    const saldoActual = materialEnControl
      ? materialEnControl.cantidadEntregada -
        materialEnControl.cantidadConsumida -
        materialEnControl.cantidadDevuelta -
        materialEnControl.cantidadDanada -
        materialEnControl.cantidadExtraviada
      : 0;
    const salidasEvento =
      cantidadConsumida +
      cantidadDevuelta +
      cantidadDanada +
      cantidadExtraviada;

    return {
      cantidadDespachar,
      salidasEvento,
      saldoActual,
      saldoDespues: saldoActual + cantidadDespachar - salidasEvento,
      pendienteDespues: materialEnControl
        ? materialEnControl.cantidadAsignada -
          materialEnControl.cantidadEntregada -
          cantidadDespachar
        : 0,
      stockDespues: materialEnControl
        ? materialEnControl.producto.stock -
          cantidadDespachar +
          cantidadDevuelta
        : 0,
    };
  }, [formularioMovimientoMaterial, materialEnControl]);

  const resumenGastos = useMemo(() => {
    const gastos = evento?.gastos || [];
    const gastosVigentes = gastos.filter(
      (gasto) => gasto.estado !== "CANCELADO",
    );

    return {
      registros: gastos.length,
      totalGastado: gastosVigentes.reduce(
        (total, gasto) => total + Number(gasto.totalGastado || 0),
        0,
      ),
      grupos: new Set(gastos.map((gasto) => gasto.grupo)).size,
      conControl: gastos.filter((gasto) => gasto.controlaStock).length,
    };
  }, [evento]);

  const calculoNuevoGasto = useMemo(() => {
    const cantidadCompra = Number(formularioGasto.cantidadCompra || 0);
    const costoUnitario = Number(formularioGasto.costoUnitario || 0);
    const factorConversion =
      formularioGasto.tipoControl === "SERVICIO"
        ? 1
        : Number(formularioGasto.factorConversion || 0);

    return {
      cantidadControl: cantidadCompra * factorConversion,
      totalGastado: cantidadCompra * costoUnitario,
    };
  }, [formularioGasto]);

  const calculoControl = useMemo(() => {
    const cantidadComprada = Number(gastoEnControl?.cantidadControl || 0);
    const cantidadLlevada = Number(formularioControl.cantidadLlevada || 0);
    const cantidadUtilizada = Number(formularioControl.cantidadUtilizada || 0);
    const cantidadDevuelta = Number(formularioControl.cantidadDevuelta || 0);
    const cantidadDanada = Number(formularioControl.cantidadDanada || 0);
    const cantidadExtraviada = Number(
      formularioControl.cantidadExtraviada || 0,
    );
    const cantidadConDestino =
      cantidadUtilizada +
      cantidadDevuelta +
      cantidadDanada +
      cantidadExtraviada;

    return {
      cantidadComprada,
      cantidadLlevada,
      cantidadConDestino,
      pendientePorLlevar: Math.max(0, cantidadComprada - cantidadLlevada),
      saldoEnEvento: Math.max(0, cantidadLlevada - cantidadConDestino),
    };
  }, [formularioControl, gastoEnControl]);

  const opcionesGasto = useMemo(() => {
    const gastos = evento?.gastos || [];

    return {
      grupos: Array.from(new Set(gastos.map((gasto) => gasto.grupo))).sort(),
      proveedores: Array.from(
        new Set(gastos.map((gasto) => gasto.proveedor)),
      ).sort(),
    };
  }, [evento]);

  const productoSeleccionado = productos.find(
    (producto) => String(producto.id) === formulario.idProducto,
  );

  const eventoCerrado =
    evento?.estado === "FINALIZADO" || evento?.estado === "CANCELADO";
  const eventoSoloLectura = !permisos?.puedeGestionar;
  const eventoNoEditable = eventoCerrado || eventoSoloLectura;
  const mensajeBloqueo = eventoCerrado
    ? "El evento está cerrado y ya no permite modificaciones."
    : `Tu rol ${permisos?.rol || ""} tiene acceso de solo lectura.`;

  function limpiarFormulario() {
    setFormulario({
      idProducto: "",
      tipoUso: "CONSUMIBLE",
      cantidadAsignada: "",
      observacion: "",
    });
  }

  function cerrarFormularioGasto() {
    setFormularioGasto(crearFormularioGastoInicial());
    setEditandoGastoId(null);
    setMostrarFormularioGasto(false);
  }

  function abrirNuevoGasto() {
    if (mostrarFormularioGasto && editandoGastoId === null) {
      cerrarFormularioGasto();
      return;
    }

    setFormularioGasto(crearFormularioGastoInicial());
    setEditandoGastoId(null);
    setGastoEnControl(null);
    setMostrarFormularioGasto(true);
  }

  function editarGasto(gasto: GastoEvento) {
    setFormularioGasto({
      grupo: gasto.grupo,
      gestionCompra: gasto.gestionCompra,
      proveedor: gasto.proveedor,
      item: gasto.item,
      cantidadCompra: String(gasto.cantidadCompra),
      unidadCompra: gasto.unidadCompra,
      factorConversion: String(gasto.factorConversion),
      unidadControl: gasto.unidadControl,
      costoUnitario: String(gasto.costoUnitario),
      tipoControl: gasto.tipoControl,
      controlaStock: gasto.controlaStock,
      fechaGasto: fechaParaInput(gasto.fechaGasto),
      numeroDocumento: gasto.numeroDocumento || "",
      observacion: gasto.observacion || "",
    });
    setGastoEnControl(null);
    setEditandoGastoId(gasto.id);
    setMostrarFormularioGasto(true);

    window.setTimeout(() => {
      document
        .getElementById("formulario-gasto-evento")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function abrirControlGasto(gasto: GastoEvento) {
    cerrarFormularioGasto();
    setGastoEnControl(gasto);
    setFormularioControl({
      cantidadLlevada: String(gasto.cantidadLlevada),
      cantidadUtilizada: String(gasto.cantidadUtilizada),
      cantidadDevuelta: String(gasto.cantidadDevuelta),
      cantidadDanada: String(gasto.cantidadDanada),
      cantidadExtraviada: String(gasto.cantidadExtraviada),
    });

    window.setTimeout(() => {
      document
        .getElementById("control-gasto-evento")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function cerrarControlGasto() {
    setGastoEnControl(null);
    setFormularioControl({
      cantidadLlevada: "0",
      cantidadUtilizada: "0",
      cantidadDevuelta: "0",
      cantidadDanada: "0",
      cantidadExtraviada: "0",
    });
  }

  async function guardarControlGasto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gastoEnControl) return;

    const cantidades = Object.values(formularioControl).map(Number);

    if (cantidades.some((cantidad) => !Number.isFinite(cantidad))) {
      toast.error("Completa todas las cantidades de control");
      return;
    }

    if (cantidades.some((cantidad) => cantidad < 0)) {
      toast.error("Las cantidades no pueden ser negativas");
      return;
    }

    if (calculoControl.cantidadLlevada > calculoControl.cantidadComprada) {
      toast.error("La cantidad llevada supera las unidades compradas");
      return;
    }

    if (calculoControl.cantidadConDestino > calculoControl.cantidadLlevada) {
      toast.error(
        "La suma de utilizado, devuelto, dañado y extraviado supera lo llevado",
      );
      return;
    }

    try {
      setGuardandoControl(true);

      const res = await fetch(
        `/api/eventos/${idEvento}/gastos?gastoId=${gastoEnControl.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formularioControl),
        },
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo actualizar el control");
      }

      toast.success(json.mensaje || "Control actualizado correctamente");
      cerrarControlGasto();
      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el control",
      );
    } finally {
      setGuardandoControl(false);
    }
  }

  function cambiarTipoControlGasto(tipoControl: TipoControlGasto) {
    setFormularioGasto((actual) => ({
      ...actual,
      tipoControl,
      controlaStock: tipoControl !== "SERVICIO",
      factorConversion:
        tipoControl === "SERVICIO" ? "1" : actual.factorConversion,
      unidadControl:
        tipoControl === "SERVICIO" ? "servicio" : actual.unidadControl,
    }));
  }

  async function guardarGasto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Number(formularioGasto.cantidadCompra) <= 0) {
      toast.error("La cantidad comprada debe ser mayor a cero");
      return;
    }

    if (Number(formularioGasto.costoUnitario) <= 0) {
      toast.error("El costo unitario debe ser mayor a cero");
      return;
    }

    if (
      formularioGasto.tipoControl !== "SERVICIO" &&
      Number(formularioGasto.factorConversion) <= 0
    ) {
      toast.error("El factor de conversión debe ser mayor a cero");
      return;
    }

    try {
      setGuardandoGasto(true);

      const url = editandoGastoId
        ? `/api/eventos/${idEvento}/gastos?gastoId=${editandoGastoId}`
        : `/api/eventos/${idEvento}/gastos`;

      const res = await fetch(url, {
        method: editandoGastoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formularioGasto),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo registrar el gasto");
      }

      toast.success(json.mensaje || "Gasto registrado correctamente");
      cerrarFormularioGasto();
      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el gasto",
      );
    } finally {
      setGuardandoGasto(false);
    }
  }

  async function eliminarGasto(gasto: GastoEvento) {
    const confirmar = window.confirm(
      `¿Eliminar el gasto "${gasto.item}" por ${formatearMoneda(
        gasto.totalGastado,
      )}? Esta acción actualizará el total gastado.`,
    );

    if (!confirmar) return;

    try {
      setEliminandoGastoId(gasto.id);

      const res = await fetch(
        `/api/eventos/${idEvento}/gastos?gastoId=${gasto.id}`,
        {
          method: "DELETE",
        },
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo eliminar el gasto");
      }

      if (editandoGastoId === gasto.id) {
        cerrarFormularioGasto();
      }

      if (gastoEnControl?.id === gasto.id) {
        cerrarControlGasto();
      }

      toast.success(json.mensaje || "Gasto eliminado correctamente");
      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar el gasto",
      );
    } finally {
      setEliminandoGastoId(null);
    }
  }

  function editarMaterial(material: MaterialEvento) {
    setMaterialEnControl(null);
    setFormulario({
      idProducto: String(material.idProducto),
      tipoUso: material.tipoUso,
      cantidadAsignada: String(material.cantidadAsignada),
      observacion: material.observacion || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirControlMaterial(material: MaterialEvento) {
    setMaterialEnControl(material);
    setFormularioMovimientoMaterial({
      cantidadDespachar: "0",
      cantidadConsumida: "0",
      cantidadDevuelta: "0",
      cantidadDanada: "0",
      cantidadExtraviada: "0",
    });

    window.setTimeout(() => {
      document
        .getElementById("control-material-evento")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function cerrarControlMaterial() {
    setMaterialEnControl(null);
    setFormularioMovimientoMaterial({
      cantidadDespachar: "0",
      cantidadConsumida: "0",
      cantidadDevuelta: "0",
      cantidadDanada: "0",
      cantidadExtraviada: "0",
    });
  }

  async function guardarMovimientoMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!materialEnControl) return;

    const cantidades = Object.values(formularioMovimientoMaterial).map(Number);

    if (
      cantidades.some((cantidad) => !Number.isInteger(cantidad) || cantidad < 0)
    ) {
      toast.error("Las cantidades deben ser números enteros no negativos");
      return;
    }

    if (cantidades.every((cantidad) => cantidad === 0)) {
      toast.error("Ingresa al menos una cantidad para registrar");
      return;
    }

    if (calculoMovimientoMaterial.pendienteDespues < 0) {
      toast.error("El despacho supera la cantidad planificada");
      return;
    }

    if (
      calculoMovimientoMaterial.cantidadDespachar >
      materialEnControl.producto.stock
    ) {
      toast.error("No hay suficiente stock para realizar el despacho");
      return;
    }

    if (calculoMovimientoMaterial.stockDespues < 0) {
      toast.error("No hay suficiente stock para realizar el despacho");
      return;
    }

    if (calculoMovimientoMaterial.saldoDespues < 0) {
      toast.error(
        "Las salidas registradas superan las unidades disponibles en el evento",
      );
      return;
    }

    try {
      setGuardandoMovimientoMaterial(true);

      const res = await fetch(
        `/api/eventos/${idEvento}/materiales?materialId=${materialEnControl.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formularioMovimientoMaterial),
        },
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo registrar el movimiento");
      }

      toast.success(json.mensaje || "Movimiento registrado correctamente");
      cerrarControlMaterial();
      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el movimiento",
      );
    } finally {
      setGuardandoMovimientoMaterial(false);
    }
  }

  async function guardarMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const idProducto = Number(formulario.idProducto);
    const cantidadAsignada = Number(formulario.cantidadAsignada);

    if (!Number.isInteger(idProducto) || idProducto <= 0) {
      toast.error("Selecciona un material");
      return;
    }

    if (!Number.isInteger(cantidadAsignada) || cantidadAsignada <= 0) {
      toast.error("La cantidad debe ser un número entero mayor a cero");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch(`/api/eventos/${idEvento}/materiales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idProducto,
          tipoUso: formulario.tipoUso,
          cantidadAsignada,
          observacion: formulario.observacion,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo agregar el material");
      }

      toast.success(json.mensaje || "Material guardado correctamente");
      limpiarFormulario();
      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el material",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarMaterial(material: MaterialEvento) {
    const confirmar = window.confirm(
      `¿Quitar ${material.producto.nombreProducto} de la planificación?`,
    );

    if (!confirmar) return;

    try {
      setEliminandoId(material.id);

      const res = await fetch(
        `/api/eventos/${idEvento}/materiales?materialId=${material.id}`,
        {
          method: "DELETE",
        },
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "No se pudo quitar el material");
      }

      toast.success("Material eliminado de la planificación");

      if (materialEnControl?.id === material.id) {
        cerrarControlMaterial();
      }

      await cargarDetalle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo quitar el material",
      );
    } finally {
      setEliminandoId(null);
    }
  }

  if (cargando && !evento) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Cargando evento...
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-red-700">
          {error || "No se encontró el evento"}
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/eventos"
            className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <button
            type="button"
            onClick={cargarDetalle}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const configEstado = estadoConfig[evento.estado];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {evento.nombre}
                </h1>

                <Badge variant="outline" className={configEstado.className}>
                  {configEstado.etiqueta}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-red-500" />
                  {formatearFecha(evento.fechaInicio)}
                  {evento.fechaFin
                    ? ` — ${formatearFecha(evento.fechaFin)}`
                    : ""}
                </span>

                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {evento.lugar || "Sin lugar definido"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-red-500" />
                  {evento.responsable?.usuario || "Sin responsable"}
                </span>
              </div>

              {evento.descripcion && (
                <p className="mt-3 max-w-3xl text-sm text-slate-600">
                  {evento.descripcion}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/eventos"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a eventos
            </Link>

            <Link
              href={`/eventos/${evento.id}/reporte`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <FileText className="h-4 w-4" />
              Reporte
            </Link>

            <button
              type="button"
              onClick={cargarDetalle}
              disabled={cargando}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      {permisos?.soloLectura && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Estás consultando este evento con el rol{" "}
          <strong>{permisos.rol}</strong>. Puedes visualizar y generar reportes,
          pero solo ADMIN y OPERADOR pueden modificar la información.
        </section>
      )}

      <section className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setPestanaActiva("gastos")}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition ${
            pestanaActiva === "gastos"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <WalletCards className="h-4 w-4" />
          Gastos
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              pestanaActiva === "gastos"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {evento.gastos.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("materiales")}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition ${
            pestanaActiva === "materiales"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Package className="h-4 w-4" />
          Materiales para llevar
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              pestanaActiva === "materiales"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {evento.materiales.length}
          </span>
        </button>
      </section>

      <div className={pestanaActiva === "materiales" ? "space-y-6" : "hidden"}>
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Package className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black">{resumen.referencias}</p>
              <p className="text-xs text-slate-500">Tipos de materiales</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Boxes className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black">
                {resumen.unidadesPlanificadas}
              </p>
              <p className="text-xs text-slate-500">Unidades planificadas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Gift className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black">{resumen.consumibles}</p>
              <p className="text-xs text-slate-500">Materiales consumibles</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <RotateCcw className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black">{resumen.retornables}</p>
              <p className="text-xs text-slate-500">Materiales retornables</p>
            </CardContent>
          </Card>
        </section>

        {materialEnControl && !eventoNoEditable && (
          <Card
            id="control-material-evento"
            className="scroll-mt-5 rounded-2xl border-blue-200 shadow-sm"
          >
            <CardHeader className="border-b border-blue-100 bg-blue-50/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Movimientos: {materialEnControl.producto.nombreProducto}
                  </CardTitle>
                  <p className="mt-2 text-sm text-slate-500">
                    Escribe solamente las cantidades que registrarás ahora. Los
                    totales anteriores se conservarán.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarControlMaterial}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cerrar
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={guardarMovimientoMaterial} className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Planificado</p>
                    <p className="mt-1 text-xl font-black text-slate-900">
                      {materialEnControl.cantidadAsignada}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs text-amber-700">Stock en almacén</p>
                    <p className="mt-1 text-xl font-black text-amber-900">
                      {materialEnControl.producto.stock}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-700">Ya llevado</p>
                    <p className="mt-1 text-xl font-black text-blue-900">
                      {materialEnControl.cantidadEntregada}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">
                      Saldo actual en evento
                    </p>
                    <p className="mt-1 text-xl font-black text-emerald-900">
                      {calculoMovimientoMaterial.saldoActual}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="material-despachar"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Despachar ahora
                    </label>
                    <input
                      id="material-despachar"
                      type="number"
                      min="0"
                      step="1"
                      value={formularioMovimientoMaterial.cantidadDespachar}
                      onChange={(event) =>
                        setFormularioMovimientoMaterial((actual) => ({
                          ...actual,
                          cantidadDespachar: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Saldrá del inventario general.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="material-consumida"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Regalado/utilizado ahora
                    </label>
                    <input
                      id="material-consumida"
                      type="number"
                      min="0"
                      step="1"
                      value={formularioMovimientoMaterial.cantidadConsumida}
                      onChange={(event) =>
                        setFormularioMovimientoMaterial((actual) => ({
                          ...actual,
                          cantidadConsumida: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Se descontará del saldo del evento.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="material-devuelta"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Devolver ahora
                    </label>
                    <input
                      id="material-devuelta"
                      type="number"
                      min="0"
                      step="1"
                      value={formularioMovimientoMaterial.cantidadDevuelta}
                      onChange={(event) =>
                        setFormularioMovimientoMaterial((actual) => ({
                          ...actual,
                          cantidadDevuelta: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Volverá al inventario general.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="material-danada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Dañado ahora
                    </label>
                    <input
                      id="material-danada"
                      type="number"
                      min="0"
                      step="1"
                      value={formularioMovimientoMaterial.cantidadDanada}
                      onChange={(event) =>
                        setFormularioMovimientoMaterial((actual) => ({
                          ...actual,
                          cantidadDanada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="material-extraviada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Extraviado ahora
                    </label>
                    <input
                      id="material-extraviada"
                      type="number"
                      min="0"
                      step="1"
                      value={formularioMovimientoMaterial.cantidadExtraviada}
                      onChange={(event) =>
                        setFormularioMovimientoMaterial((actual) => ({
                          ...actual,
                          cantidadExtraviada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stock después
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-900">
                      {calculoMovimientoMaterial.stockDespues}
                    </p>
                  </div>

                  <div className="sm:text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pendiente por despachar
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-900">
                      {calculoMovimientoMaterial.pendienteDespues}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Saldo en evento después
                    </p>
                    <p className="mt-1 text-xl font-black text-emerald-700">
                      {calculoMovimientoMaterial.saldoDespues}
                    </p>
                  </div>
                </div>

                {(calculoMovimientoMaterial.saldoDespues < 0 ||
                  calculoMovimientoMaterial.pendienteDespues < 0 ||
                  calculoMovimientoMaterial.cantidadDespachar >
                    materialEnControl.producto.stock) && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Las cantidades ingresadas superan el stock, la planificación
                    o el saldo disponible en el evento.
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cerrarControlMaterial}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      guardandoMovimientoMaterial ||
                      calculoMovimientoMaterial.saldoDespues < 0 ||
                      calculoMovimientoMaterial.pendienteDespues < 0 ||
                      calculoMovimientoMaterial.cantidadDespachar >
                        materialEnControl.producto.stock
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {guardandoMovimientoMaterial ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {guardandoMovimientoMaterial
                      ? "Registrando..."
                      : "Registrar movimientos"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
          <Card className="h-fit rounded-2xl border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Agregar material a la planificación
              </CardTitle>
              <p className="text-sm text-slate-500">
                Esto todavía no descontará unidades del inventario.
              </p>
            </CardHeader>

            <CardContent>
              {eventoNoEditable ? (
                <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                  {mensajeBloqueo}
                </div>
              ) : (
                <form onSubmit={guardarMaterial} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="producto"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Material *
                    </label>

                    <select
                      id="producto"
                      value={formulario.idProducto}
                      onChange={(event) =>
                        setFormulario((actual) => ({
                          ...actual,
                          idProducto: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    >
                      <option value="">Seleccionar material</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombreProducto} · Stock: {producto.stock}
                        </option>
                      ))}
                    </select>

                    {productoSeleccionado && (
                      <p className="text-xs text-slate-500">
                        {productoSeleccionado.codigo || "Sin código"} ·{" "}
                        {productoSeleccionado.unidadMedida} · Disponible:{" "}
                        <strong>{productoSeleccionado.stock}</strong>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tipoUso"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Tipo de uso *
                    </label>

                    <select
                      id="tipoUso"
                      value={formulario.tipoUso}
                      onChange={(event) =>
                        setFormulario((actual) => ({
                          ...actual,
                          tipoUso: event.target.value as TipoUsoEvento,
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="CONSUMIBLE">
                        Consumible o para regalar
                      </option>
                      <option value="RETORNABLE">Retornable</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="cantidad"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Cantidad que se llevará *
                    </label>

                    <input
                      id="cantidad"
                      type="number"
                      min={1}
                      step={1}
                      value={formulario.cantidadAsignada}
                      onChange={(event) =>
                        setFormulario((actual) => ({
                          ...actual,
                          cantidadAsignada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: 200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="observacion"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Observación
                    </label>

                    <textarea
                      id="observacion"
                      value={formulario.observacion}
                      onChange={(event) =>
                        setFormulario((actual) => ({
                          ...actual,
                          observacion: event.target.value,
                        }))
                      }
                      className="min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      placeholder="Ej.: Para entregar a los visitantes"
                    />
                  </div>

                  <div className="flex gap-3">
                    {formulario.idProducto && (
                      <button
                        type="button"
                        onClick={limpiarFormulario}
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-slate-50"
                      >
                        Limpiar
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={guardando}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {guardando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : formulario.idProducto &&
                        evento.materiales.some(
                          (material) =>
                            material.idProducto ===
                            Number(formulario.idProducto),
                        ) ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {guardando ? "Guardando..." : "Guardar material"}
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Lista de preparación</CardTitle>
              <p className="text-sm text-slate-500">
                Todo lo planificado para llevar al evento.
              </p>
            </CardHeader>

            <CardContent>
              {evento.materiales.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 px-6 text-center">
                  <Package className="h-9 w-9 text-red-500" />
                  <h2 className="mt-4 font-bold text-slate-900">
                    Todavía no agregaste materiales
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    Selecciona los cuadernos, bolígrafos, banners u otros
                    elementos que se llevarán al evento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evento.materiales.map((material) => {
                    const saldoEvento = Math.max(
                      0,
                      material.cantidadEntregada -
                        material.cantidadConsumida -
                        material.cantidadDevuelta -
                        material.cantidadDanada -
                        material.cantidadExtraviada,
                    );

                    return (
                      <article
                        key={material.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-900">
                                {material.producto.nombreProducto}
                              </h3>

                              <Badge
                                variant="outline"
                                className={
                                  material.tipoUso === "CONSUMIBLE"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }
                              >
                                {material.tipoUso === "CONSUMIBLE"
                                  ? "Consumible"
                                  : "Retornable"}
                              </Badge>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {material.producto.codigo || "Sin código"} ·{" "}
                              {material.producto.unidadMedida} · Stock general:{" "}
                              {material.producto.stock}
                            </p>

                            {material.observacion && (
                              <p className="mt-2 text-sm text-slate-600">
                                {material.observacion}
                              </p>
                            )}
                          </div>

                          {!eventoNoEditable && (
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => abrirControlMaterial(material)}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-blue-200 px-3 text-xs font-medium text-blue-700 hover:bg-blue-50"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Controlar
                              </button>

                              <button
                                type="button"
                                onClick={() => editarMaterial(material)}
                                className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarMaterial(material)}
                                disabled={eliminandoId === material.id}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                              >
                                {eliminandoId === material.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Quitar
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">
                              Planificado
                            </p>
                            <p className="mt-1 font-black text-slate-900">
                              {material.cantidadAsignada}
                            </p>
                          </div>

                          <div className="rounded-xl bg-amber-50 p-3">
                            <p className="text-xs text-amber-700">Llevado</p>
                            <p className="mt-1 font-black text-amber-900">
                              {material.cantidadEntregada}
                            </p>
                          </div>

                          <div className="rounded-xl bg-red-50 p-3">
                            <p className="text-xs text-red-700">
                              Regalado/utilizado
                            </p>
                            <p className="mt-1 font-black text-red-900">
                              {material.cantidadConsumida}
                            </p>
                          </div>

                          <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-xs text-emerald-700">
                              Saldo en evento
                            </p>
                            <p className="mt-1 font-black text-emerald-900">
                              {saldoEvento}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <div className={pestanaActiva === "gastos" ? "space-y-6" : "hidden"}>
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Banknote className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black text-slate-900">
                {formatearMoneda(resumenGastos.totalGastado)}
              </p>
              <p className="text-xs text-slate-500">
                Total gastado hasta ahora
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <FileText className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black text-slate-900">
                {resumenGastos.registros}
              </p>
              <p className="text-xs text-slate-500">Gastos registrados</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Boxes className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black text-slate-900">
                {resumenGastos.grupos}
              </p>
              <p className="text-xs text-slate-500">Grupos de compra</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-red-100 shadow-sm">
            <CardContent className="p-5">
              <Package className="h-5 w-5 text-red-600" />
              <p className="mt-3 text-2xl font-black text-slate-900">
                {resumenGastos.conControl}
              </p>
              <p className="text-xs text-slate-500">
                Ítems con control de unidades
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={abrirNuevoGasto}
            disabled={eventoNoEditable}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-red-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mostrarFormularioGasto && editandoGastoId === null ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {mostrarFormularioGasto && editandoGastoId === null
              ? "Cerrar formulario"
              : "Nuevo gasto"}
          </button>
        </div>

        {eventoNoEditable && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {mensajeBloqueo}
          </div>
        )}

        {mostrarFormularioGasto && !eventoNoEditable && (
          <Card
            id="formulario-gasto-evento"
            className="scroll-mt-5 rounded-2xl border-red-200 shadow-sm"
          >
            <CardHeader className="border-b border-red-100 bg-red-50/40">
              <CardTitle className="text-base">
                {editandoGastoId ? "Editar gasto" : "Registrar nuevo gasto"}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {editandoGastoId
                  ? "Los cambios volverán a calcular las unidades y el total acumulado."
                  : "El total se sumará automáticamente a los gastos acumulados del evento."}
              </p>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={guardarGasto} className="space-y-6">
                <datalist id="grupos-gasto-evento">
                  {opcionesGasto.grupos.map((grupo) => (
                    <option key={grupo} value={grupo} />
                  ))}
                </datalist>

                <datalist id="proveedores-gasto-evento">
                  {opcionesGasto.proveedores.map((proveedor) => (
                    <option key={proveedor} value={proveedor} />
                  ))}
                </datalist>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2 xl:col-span-2">
                    <label
                      htmlFor="gasto-grupo"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Grupo de compra *
                    </label>
                    <input
                      id="gasto-grupo"
                      list="grupos-gasto-evento"
                      value={formularioGasto.grupo}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          grupo: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: Insumos para limpieza"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-gestion"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Gestión de compra *
                    </label>
                    <input
                      id="gasto-gestion"
                      value={formularioGasto.gestionCompra}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          gestionCompra: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-fecha"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Fecha del gasto *
                    </label>
                    <input
                      id="gasto-fecha"
                      type="date"
                      value={formularioGasto.fechaGasto}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          fechaGasto: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div className="space-y-2 xl:col-span-2">
                    <label
                      htmlFor="gasto-item"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Ítem o producto *
                    </label>
                    <input
                      id="gasto-item"
                      value={formularioGasto.item}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          item: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: Coca-Cola pequeña x 6 un"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-proveedor"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Proveedor *
                    </label>
                    <input
                      id="gasto-proveedor"
                      list="proveedores-gasto-evento"
                      value={formularioGasto.proveedor}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          proveedor: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: Embol"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-documento"
                      className="text-sm font-semibold text-slate-700"
                    >
                      N.º de factura o recibo
                    </label>
                    <input
                      id="gasto-documento"
                      value={formularioGasto.numeroDocumento}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          numeroDocumento: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-tipo"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Tipo *
                    </label>
                    <select
                      id="gasto-tipo"
                      value={formularioGasto.tipoControl}
                      onChange={(event) =>
                        cambiarTipoControlGasto(
                          event.target.value as TipoControlGasto,
                        )
                      }
                      className={inputClassName}
                    >
                      <option value="CONSUMIBLE">
                        Consumible o para regalar
                      </option>
                      <option value="RETORNABLE">Retornable</option>
                      <option value="SERVICIO">Servicio o alquiler</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-cantidad"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Cantidad comprada *
                    </label>
                    <input
                      id="gasto-cantidad"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formularioGasto.cantidadCompra}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          cantidadCompra: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: 200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-unidad-compra"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Unidad de compra *
                    </label>
                    <input
                      id="gasto-unidad-compra"
                      value={formularioGasto.unidadCompra}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          unidadCompra: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: paq, un, caja"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="gasto-costo"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Costo por unidad de compra *
                    </label>
                    <input
                      id="gasto-costo"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formularioGasto.costoUnitario}
                      onChange={(event) =>
                        setFormularioGasto((actual) => ({
                          ...actual,
                          costoUnitario: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Ej.: 19.80"
                      required
                    />
                  </div>

                  {formularioGasto.tipoControl !== "SERVICIO" && (
                    <>
                      <div className="space-y-2">
                        <label
                          htmlFor="gasto-factor"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Unidades dentro de cada compra *
                        </label>
                        <input
                          id="gasto-factor"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={formularioGasto.factorConversion}
                          onChange={(event) =>
                            setFormularioGasto((actual) => ({
                              ...actual,
                              factorConversion: event.target.value,
                            }))
                          }
                          className={inputClassName}
                          placeholder="Ej.: 6"
                          required
                        />
                        <p className="text-xs text-slate-500">
                          Para un paquete de 6 botellas, escribe 6.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="gasto-unidad-control"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Unidad que se controlará *
                        </label>
                        <input
                          id="gasto-unidad-control"
                          value={formularioGasto.unidadControl}
                          onChange={(event) =>
                            setFormularioGasto((actual) => ({
                              ...actual,
                              unidadControl: event.target.value,
                            }))
                          }
                          className={inputClassName}
                          placeholder="Ej.: botella"
                          required
                        />
                      </div>

                      <div className="flex items-end pb-2">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={formularioGasto.controlaStock}
                            onChange={(event) =>
                              setFormularioGasto((actual) => ({
                                ...actual,
                                controlaStock: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-slate-300 accent-red-600"
                          />
                          Controlar las unidades que se llevarán
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cantidad para controlar
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-900">
                      {formularioGasto.tipoControl === "SERVICIO"
                        ? "No aplica"
                        : `${formatearCantidad(calculoNuevoGasto.cantidadControl)} ${
                            formularioGasto.unidadControl || "unidades"
                          }`}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Total de este gasto
                    </p>
                    <p className="mt-1 text-2xl font-black text-red-700">
                      {formatearMoneda(calculoNuevoGasto.totalGastado)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gasto-observacion"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Observación
                  </label>
                  <textarea
                    id="gasto-observacion"
                    value={formularioGasto.observacion}
                    onChange={(event) =>
                      setFormularioGasto((actual) => ({
                        ...actual,
                        observacion: event.target.value,
                      }))
                    }
                    className="min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="Información adicional de la compra"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cerrarFormularioGasto}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardandoGasto}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {guardandoGasto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {guardandoGasto
                      ? "Guardando..."
                      : editandoGastoId
                        ? "Guardar cambios"
                        : "Guardar gasto"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {gastoEnControl && !eventoNoEditable && (
          <Card
            id="control-gasto-evento"
            className="scroll-mt-5 rounded-2xl border-blue-200 shadow-sm"
          >
            <CardHeader className="border-b border-blue-100 bg-blue-50/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Control de unidades: {gastoEnControl.item}
                  </CardTitle>
                  <p className="mt-2 text-sm text-slate-500">
                    Registra cantidades acumuladas. Puedes volver a este control
                    y actualizarlas durante la feria.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarControlGasto}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cerrar
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={guardarControlGasto} className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Total comprado</p>
                    <p className="mt-1 text-xl font-black text-slate-900">
                      {formatearCantidad(gastoEnControl.cantidadControl)}{" "}
                      {gastoEnControl.unidadControl}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs text-amber-700">
                      Pendiente por llevar
                    </p>
                    <p className="mt-1 text-xl font-black text-amber-900">
                      {formatearCantidad(calculoControl.pendientePorLlevar)}{" "}
                      {gastoEnControl.unidadControl}
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-xs text-red-700">Regalado/utilizado</p>
                    <p className="mt-1 text-xl font-black text-red-900">
                      {formatearCantidad(formularioControl.cantidadUtilizada)}{" "}
                      {gastoEnControl.unidadControl}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">Saldo en evento</p>
                    <p className="mt-1 text-xl font-black text-emerald-900">
                      {formatearCantidad(calculoControl.saldoEnEvento)}{" "}
                      {gastoEnControl.unidadControl}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="control-llevada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Cantidad llevada
                    </label>
                    <input
                      id="control-llevada"
                      type="number"
                      min="0"
                      max={Number(gastoEnControl.cantidadControl)}
                      step="0.01"
                      value={formularioControl.cantidadLlevada}
                      onChange={(event) =>
                        setFormularioControl((actual) => ({
                          ...actual,
                          cantidadLlevada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Unidades enviadas al evento.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="control-utilizada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Regalado/utilizado
                    </label>
                    <input
                      id="control-utilizada"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formularioControl.cantidadUtilizada}
                      onChange={(event) =>
                        setFormularioControl((actual) => ({
                          ...actual,
                          cantidadUtilizada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Entregado o consumido.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="control-devuelta"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Devuelto
                    </label>
                    <input
                      id="control-devuelta"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formularioControl.cantidadDevuelta}
                      onChange={(event) =>
                        setFormularioControl((actual) => ({
                          ...actual,
                          cantidadDevuelta: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Regresó del evento.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="control-danada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Dañado
                    </label>
                    <input
                      id="control-danada"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formularioControl.cantidadDanada}
                      onChange={(event) =>
                        setFormularioControl((actual) => ({
                          ...actual,
                          cantidadDanada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Producto inutilizable.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="control-extraviada"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Extraviado
                    </label>
                    <input
                      id="control-extraviada"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formularioControl.cantidadExtraviada}
                      onChange={(event) =>
                        setFormularioControl((actual) => ({
                          ...actual,
                          cantidadExtraviada: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      No pudo localizarse.
                    </p>
                  </div>
                </div>

                {calculoControl.cantidadConDestino >
                  calculoControl.cantidadLlevada && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    La suma de utilizado, devuelto, dañado y extraviado supera
                    la cantidad llevada. Corrige los valores antes de guardar.
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cerrarControlGasto}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      guardandoControl ||
                      calculoControl.cantidadConDestino >
                        calculoControl.cantidadLlevada ||
                      calculoControl.cantidadLlevada >
                        calculoControl.cantidadComprada
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {guardandoControl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {guardandoControl ? "Guardando..." : "Guardar control"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden rounded-2xl border-red-100 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Gastos del evento</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Compras y servicios acumulados. Este total puede seguir
                  aumentando.
                </p>
              </div>

              <div className="rounded-xl bg-red-50 px-4 py-3 text-right">
                <p className="text-xs font-medium text-red-600">
                  Total gastado
                </p>
                <p className="font-black text-red-700">
                  {formatearMoneda(resumenGastos.totalGastado)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {evento.gastos.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <Banknote className="h-10 w-10 text-red-400" />
                <h2 className="mt-4 font-bold text-slate-900">
                  Todavía no hay gastos registrados
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Aquí aparecerán las compras y servicios utilizados para el
                  evento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1420px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Grupo</th>
                      <th className="px-5 py-4 font-semibold">Ítem</th>
                      <th className="px-5 py-4 font-semibold">Proveedor</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Compra
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Control real
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Costo unitario
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Total
                      </th>
                      <th className="px-5 py-4 font-semibold">Estado</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {evento.gastos.map((gasto) => {
                      const estado = estadoGastoConfig[gasto.estado];
                      const saldoControl = Math.max(
                        0,
                        Number(gasto.cantidadLlevada) -
                          Number(gasto.cantidadUtilizada) -
                          Number(gasto.cantidadDevuelta) -
                          Number(gasto.cantidadDanada) -
                          Number(gasto.cantidadExtraviada),
                      );

                      return (
                        <tr key={gasto.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4 align-top">
                            <p className="max-w-52 font-medium text-slate-700">
                              {gasto.grupo}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {gasto.gestionCompra}
                            </p>
                          </td>

                          <td className="px-5 py-4 align-top">
                            <p className="max-w-64 font-semibold text-slate-900">
                              {gasto.item}
                            </p>
                            <Badge
                              variant="outline"
                              className="mt-2 border-slate-200 bg-white text-[10px] text-slate-500"
                            >
                              {gasto.tipoControl === "SERVICIO"
                                ? "Servicio"
                                : gasto.tipoControl === "RETORNABLE"
                                  ? "Retornable"
                                  : "Consumible"}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 align-top text-slate-600">
                            {gasto.proveedor}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right align-top text-slate-700">
                            {formatearCantidad(gasto.cantidadCompra)}{" "}
                            {gasto.unidadCompra}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right align-top">
                            {gasto.controlaStock ? (
                              <div>
                                <p className="font-bold text-slate-900">
                                  {formatearCantidad(gasto.cantidadControl)}{" "}
                                  <span className="text-slate-500">
                                    {gasto.unidadControl}
                                  </span>
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Llevado:{" "}
                                  {formatearCantidad(gasto.cantidadLlevada)} ·{" "}
                                  Usado:{" "}
                                  {formatearCantidad(gasto.cantidadUtilizada)}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-emerald-600">
                                  Saldo en evento:{" "}
                                  {formatearCantidad(saldoControl)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">No aplica</span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right align-top text-slate-600">
                            {formatearMoneda(gasto.costoUnitario)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right align-top font-black text-slate-900">
                            {formatearMoneda(gasto.totalGastado)}
                          </td>

                          <td className="px-5 py-4 align-top">
                            <Badge
                              variant="outline"
                              className={estado.className}
                            >
                              {estado.etiqueta}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 align-top">
                            {eventoNoEditable ? (
                              <p className="text-right text-xs text-slate-400">
                                {eventoCerrado
                                  ? "Evento cerrado"
                                  : "Solo lectura"}
                              </p>
                            ) : (
                              <div className="flex justify-end gap-2">
                                {gasto.controlaStock &&
                                  gasto.tipoControl !== "SERVICIO" && (
                                    <button
                                      type="button"
                                      onClick={() => abrirControlGasto(gasto)}
                                      className="inline-flex h-9 items-center gap-2 rounded-md border border-blue-200 px-3 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                      <ClipboardCheck className="h-3.5 w-3.5" />
                                      Controlar
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  onClick={() => editarGasto(gasto)}
                                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => eliminarGasto(gasto)}
                                  disabled={eliminandoGastoId === gasto.id}
                                  className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                >
                                  {eliminandoGastoId === gasto.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}