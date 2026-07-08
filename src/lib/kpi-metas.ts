export type Perspectiva = "financiera" | "clientes" | "procesosInternos" | "aprendizaje"

export type MetaTipo = "min" | "max" | "porcentaje_crecimiento"
export type Frecuencia = "Diaria" | "Semanal" | "Mensual"
export type Cumplimiento = "superado" | "en_meta" | "bajo_meta" | "critico"

export interface KPIMeta {
  id: string
  nombreEstrategico: string
  indicador: string
  objetivo: string
  meta: string
  metaValor: number
  metaTipo: MetaTipo
  frecuencia: Frecuencia
  unidad: "BOB" | "porcentaje" | "numero" | "ratio"
  perspectiva: Perspectiva
}

export interface KPIEvaluado extends KPIMeta {
  valorActual: number
  valorFormateado: string
  cumplimiento: Cumplimiento
  porcentajeCumplimiento: number
}

// --- Definiciones de KPIs por perspectiva ---

export const KPI_METAS: KPIMeta[] = [
  // ═══ PERSPECTIVA FINANCIERA ═══
  {
    id: "fin_ingresos",
    nombreEstrategico: "Maximizar ingresos por ventas",
    indicador: "Ingresos Brutos",
    objetivo: "Incrementar el volumen de ingresos brutos por ventas completadas",
    meta: "+5% vs período anterior",
    metaValor: 5,
    metaTipo: "porcentaje_crecimiento",
    frecuencia: "Semanal",
    unidad: "BOB",
    perspectiva: "financiera",
  },
  {
    id: "fin_ganancia",
    nombreEstrategico: "Incrementar la ganancia bruta",
    indicador: "Ganancia Bruta",
    objetivo: "Asegurar que la diferencia entre ingresos y costos sea positiva y creciente",
    meta: "+5% vs período anterior",
    metaValor: 5,
    metaTipo: "porcentaje_crecimiento",
    frecuencia: "Semanal",
    unidad: "BOB",
    perspectiva: "financiera",
  },
  {
    id: "fin_margen",
    nombreEstrategico: "Proteger el margen de rentabilidad",
    indicador: "Margen Promedio",
    objetivo: "Mantener un margen de ganancia saludable en productos activos",
    meta: ">= 35%",
    metaValor: 35,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "financiera",
  },
  {
    id: "fin_compras_ratio",
    nombreEstrategico: "Controlar costos de adquisición",
    indicador: "Ratio Compras/Ventas",
    objetivo: "Optimizar la inversión en mercadería respecto a las ventas",
    meta: "<= 65%",
    metaValor: 65,
    metaTipo: "max",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "financiera",
  },

  // ═══ PERSPECTIVA DE CLIENTES ═══
  {
    id: "cli_activos",
    nombreEstrategico: "Ampliar la base de clientes activos",
    indicador: "Clientes Activos",
    objetivo: "Aumentar la cantidad de clientes que realizan al menos una compra",
    meta: ">= 8 clientes en período",
    metaValor: 8,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "numero",
    perspectiva: "clientes",
  },
  {
    id: "cli_nuevos",
    nombreEstrategico: "Captar nuevos clientes",
    indicador: "Clientes Nuevos",
    objetivo: "Mantener un flujo constante de nuevos compradores",
    meta: ">= 3 por semana",
    metaValor: 3,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "numero",
    perspectiva: "clientes",
  },
  {
    id: "cli_frecuentes",
    nombreEstrategico: "Fidelizar clientes recurrentes",
    indicador: "Clientes Frecuentes",
    objetivo: "Incrementar la proporción de clientes que regresan a comprar (5+ compras). Nuevo=1 compra, Ocasional=2-4, Frecuente=5+",
    meta: ">= 20% de clientes activos",
    metaValor: 20,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "clientes",
  },
  {
    id: "cli_ticket",
    nombreEstrategico: "Incrementar el valor por transacción",
    indicador: "Ticket Promedio",
    objetivo: "Elevar el monto promedio que gasta cada cliente por compra",
    meta: ">= Bs. 100",
    metaValor: 100,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "BOB",
    perspectiva: "clientes",
  },

  // ═══ PROCESOS INTERNOS ═══
  {
    id: "proc_rotacion",
    nombreEstrategico: "Optimizar la rotación de inventario",
    indicador: "Rotación de Inventario",
    objetivo: "Asegurar que la mercadería no se estanque en almacén",
    meta: ">= 1.0x",
    metaValor: 1.0,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "ratio",
    perspectiva: "procesosInternos",
  },
  {
    id: "proc_stock_critico",
    nombreEstrategico: "Minimizar quiebres de stock",
    indicador: "Productos con Stock Crítico",
    objetivo: "Reducir productos con stock por debajo del mínimo configurado",
    meta: "<= 10 productos",
    metaValor: 10,
    metaTipo: "max",
    frecuencia: "Semanal",
    unidad: "numero",
    perspectiva: "procesosInternos",
  },
  {
    id: "proc_agotados",
    nombreEstrategico: "Eliminar productos agotados",
    indicador: "Productos Sin Stock",
    objetivo: "Evitar la pérdida de ventas por falta de mercadería",
    meta: "0 productos agotados",
    metaValor: 0,
    metaTipo: "max",
    frecuencia: "Diaria",
    unidad: "numero",
    perspectiva: "procesosInternos",
  },
  {
    id: "proc_anulacion",
    nombreEstrategico: "Reducir anulaciones de venta",
    indicador: "Tasa de Anulación",
    objetivo: "Minimizar errores operativos que generen anulaciones",
    meta: "<= 5%",
    metaValor: 5,
    metaTipo: "max",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "procesosInternos",
  },

  // ═══ APRENDIZAJE Y CRECIMIENTO ═══
  {
    id: "apr_ventas",
    nombreEstrategico: "Identificar tendencias de crecimiento",
    indicador: "Variación de Ventas",
    objetivo: "Detectar si las ventas crecen o decrecen período a período",
    meta: ">= +5% vs anterior",
    metaValor: 5,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "aprendizaje",
  },
  {
    id: "apr_margen",
    nombreEstrategico: "Mantener estabilidad del margen",
    indicador: "Variación de Margen",
    objetivo: "Asegurar que el margen no se deteriore entre períodos",
    meta: ">= 0 pp",
    metaValor: 0,
    metaTipo: "min",
    frecuencia: "Semanal",
    unidad: "porcentaje",
    perspectiva: "aprendizaje",
  },
]

// --- Función de evaluación de semáforo ---

export function evaluarCumplimiento(
  valor: number,
  metaValor: number,
  metaTipo: MetaTipo,
): { cumplimiento: Cumplimiento; porcentaje: number } {
  if (metaTipo === "min" || metaTipo === "porcentaje_crecimiento") {
    // Queremos que el valor sea >= metaValor
    if (metaValor === 0) {
      // Caso especial: meta es 0 (ej: variación margen >= 0)
      if (valor > 0) return { cumplimiento: "superado", porcentaje: 100 }
      if (valor === 0) return { cumplimiento: "en_meta", porcentaje: 100 }
      if (valor >= -5) return { cumplimiento: "bajo_meta", porcentaje: 50 }
      return { cumplimiento: "critico", porcentaje: 0 }
    }
    const porcentaje = (valor / metaValor) * 100
    if (valor >= metaValor * 1.1) return { cumplimiento: "superado", porcentaje: Math.min(porcentaje, 150) }
    if (valor >= metaValor) return { cumplimiento: "en_meta", porcentaje }
    if (valor >= metaValor * 0.7) return { cumplimiento: "bajo_meta", porcentaje }
    return { cumplimiento: "critico", porcentaje: Math.max(porcentaje, 0) }
  }

  // metaTipo === "max" → queremos que el valor sea <= metaValor
  if (metaValor === 0) {
    // Caso especial: meta es 0 (ej: 0 agotados)
    if (valor === 0) return { cumplimiento: "superado", porcentaje: 100 }
    if (valor <= 2) return { cumplimiento: "bajo_meta", porcentaje: 50 }
    return { cumplimiento: "critico", porcentaje: 0 }
  }
  const porcentajeInverso = ((metaValor - valor) / metaValor) * 100 + 100
  if (valor <= metaValor * 0.5) return { cumplimiento: "superado", porcentaje: 100 }
  if (valor <= metaValor) return { cumplimiento: "en_meta", porcentaje: Math.max(porcentajeInverso, 50) }
  if (valor <= metaValor * 1.3) return { cumplimiento: "bajo_meta", porcentaje: Math.max(porcentajeInverso, 20) }
  return { cumplimiento: "critico", porcentaje: Math.max(porcentajeInverso, 0) }
}
