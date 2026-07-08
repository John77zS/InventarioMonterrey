"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search, Users, Settings, GraduationCap,
  DollarSign, Target, CheckCircle2, AlertTriangle, XCircle, ArrowUpCircle,
} from "lucide-react"
import type { Perspectiva, Cumplimiento, KPIEvaluado } from "@/lib/kpi-metas"
import { fechaLocalHoy, fechaLocalInicioMes } from "@/lib/utils"

interface CMIData {
  financiera: { ingresosBrutos: number; costoTotal: number; gananciaTotal: number; margenPromedio: number; totalCompras: number }
  clientes: { clientesActivos: number; clientesNuevos: number; frecuentes: number; ocasionales: number; ticketPromedio: number }
  procesosInternos: { rotacionInventario: number; productosStockCritico: number; productosAgotados: number; tasaAnulacion: number }
  aprendizaje: { cambioVentas: number; cambioMargen: number; ventasActual: number; ventasAnterior: number }
  evaluacion: KPIEvaluado[]
}

function fmt(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const PERSPECTIVAS: {
  key: Perspectiva
  titulo: string
  color: string
  borderColor: string
  icon: typeof DollarSign
  iconColor: string
}[] = [
  { key: "financiera", titulo: "Perspectiva Financiera", color: "green", borderColor: "border-l-green-500", icon: DollarSign, iconColor: "text-green-600" },
  { key: "clientes", titulo: "Perspectiva de Clientes", color: "blue", borderColor: "border-l-blue-500", icon: Users, iconColor: "text-blue-600" },
  { key: "procesosInternos", titulo: "Procesos Internos", color: "orange", borderColor: "border-l-orange-500", icon: Settings, iconColor: "text-orange-600" },
  { key: "aprendizaje", titulo: "Aprendizaje y Crecimiento", color: "purple", borderColor: "border-l-purple-500", icon: GraduationCap, iconColor: "text-purple-600" },
]

function SemaforoBadge({ cumplimiento }: { cumplimiento: Cumplimiento }) {
  switch (cumplimiento) {
    case "superado":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
          <ArrowUpCircle className="h-3 w-3" />
          Superado
        </Badge>
      )
    case "en_meta":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          En Meta
        </Badge>
      )
    case "bajo_meta":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-300 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Bajo Meta
        </Badge>
      )
    case "critico":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-300 gap-1">
          <XCircle className="h-3 w-3" />
          Crítico
        </Badge>
      )
  }
}

function BarraProgreso({ porcentaje, cumplimiento }: { porcentaje: number; cumplimiento: Cumplimiento }) {
  const colorMap: Record<Cumplimiento, string> = {
    superado: "bg-green-500",
    en_meta: "bg-green-400",
    bajo_meta: "bg-amber-400",
    critico: "bg-red-500",
  }
  const ancho = Math.min(Math.max(porcentaje, 0), 100)
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${colorMap[cumplimiento]}`}
        style={{ width: `${ancho}%` }}
      />
    </div>
  )
}

function FrecuenciaBadge({ frecuencia }: { frecuencia: string }) {
  const colorMap: Record<string, string> = {
    Diaria: "bg-violet-50 text-violet-700 border-violet-200",
    Semanal: "bg-sky-50 text-sky-700 border-sky-200",
    Mensual: "bg-slate-100 text-slate-700 border-slate-300",
  }
  return <Badge variant="outline" className={`text-[10px] ${colorMap[frecuencia] ?? ""}`}>{frecuencia}</Badge>
}

function ResumenRapido({ data }: { data: CMIData }) {
  const total = data.evaluacion.length
  const superados = data.evaluacion.filter((e) => e.cumplimiento === "superado").length
  const enMeta = data.evaluacion.filter((e) => e.cumplimiento === "en_meta").length
  const bajoMeta = data.evaluacion.filter((e) => e.cumplimiento === "bajo_meta").length
  const criticos = data.evaluacion.filter((e) => e.cumplimiento === "critico").length

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Card className="p-3 text-center">
        <p className="text-xs text-muted-foreground">Total KPIs</p>
        <p className="text-2xl font-bold">{total}</p>
      </Card>
      <Card className="p-3 text-center border-green-200">
        <p className="text-xs text-green-600">Superados</p>
        <p className="text-2xl font-bold text-green-600">{superados}</p>
      </Card>
      <Card className="p-3 text-center border-green-100">
        <p className="text-xs text-green-500">En Meta</p>
        <p className="text-2xl font-bold text-green-500">{enMeta}</p>
      </Card>
      <Card className="p-3 text-center border-amber-200">
        <p className="text-xs text-amber-600">Bajo Meta</p>
        <p className="text-2xl font-bold text-amber-600">{bajoMeta}</p>
      </Card>
      <Card className="p-3 text-center border-red-200">
        <p className="text-xs text-red-600">Críticos</p>
        <p className="text-2xl font-bold text-red-600">{criticos}</p>
      </Card>
    </div>
  )
}

function PerspectivaCard({ config, kpis, data }: {
  config: (typeof PERSPECTIVAS)[0]
  kpis: KPIEvaluado[]
  data: CMIData
}) {
  const Icon = config.icon

  // Valores de resumen por perspectiva
  const resumenMap: Record<Perspectiva, { label: string; valor: string }[]> = {
    financiera: [
      { label: "Ingresos", valor: fmt(data.financiera.ingresosBrutos) },
      { label: "Ganancia", valor: fmt(data.financiera.gananciaTotal) },
    ],
    clientes: [
      { label: "Activos", valor: String(data.clientes.clientesActivos) },
      { label: "Ticket Prom.", valor: fmt(data.clientes.ticketPromedio) },
    ],
    procesosInternos: [
      { label: "Stock Crítico", valor: String(data.procesosInternos.productosStockCritico) },
      { label: "Anulación", valor: `${data.procesosInternos.tasaAnulacion.toFixed(1)}%` },
    ],
    aprendizaje: [
      { label: "Ventas Actual", valor: fmt(data.aprendizaje.ventasActual) },
      { label: "Ventas Anterior", valor: fmt(data.aprendizaje.ventasAnterior) },
    ],
  }

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
            {config.titulo}
          </CardTitle>
          <div className="flex gap-3">
            {resumenMap[config.key].map((r) => (
              <div key={r.label} className="text-right">
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
                <p className="text-sm font-semibold">{r.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Nombre Estratégico</TableHead>
                <TableHead className="w-[18%]">Objetivo</TableHead>
                <TableHead className="text-center w-[12%]">Valor Actual</TableHead>
                <TableHead className="text-center w-[10%]">Meta</TableHead>
                <TableHead className="text-center w-[8%]">Frec.</TableHead>
                <TableHead className="text-center w-[12%]">Estado</TableHead>
                <TableHead className="w-[10%]">Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm leading-tight">{kpi.nombreEstrategico}</p>
                      <p className="text-[11px] text-muted-foreground">{kpi.indicador}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground leading-snug">{kpi.objetivo}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-bold">{kpi.valorFormateado}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{kpi.meta}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <FrecuenciaBadge frecuencia={kpi.frecuencia} />
                  </TableCell>
                  <TableCell className="text-center">
                    <SemaforoBadge cumplimiento={kpi.cumplimiento} />
                  </TableCell>
                  <TableCell>
                    <BarraProgreso porcentaje={kpi.porcentajeCumplimiento} cumplimiento={kpi.cumplimiento} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function TabCMI() {
  const [desde, setDesde] = useState(fechaLocalInicioMes())
  const [hasta, setHasta] = useState(fechaLocalHoy())
  const [data, setData] = useState<CMIData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCMI = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/cmi?desde=${desde}&hasta=${hasta}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Error al generar CMI")
    } finally {
      setLoading(false)
    }
  }, [desde, hasta])

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="text-xs text-muted-foreground">Desde</label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Hasta</label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-40" />
        </div>
        <Button onClick={fetchCMI} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Generando..." : "Generar CMI"}
        </Button>
      </div>

      {data && (
        <div className="space-y-6">
          <ResumenRapido data={data} />

          {PERSPECTIVAS.map((config) => {
            const kpis = data.evaluacion.filter((e) => e.perspectiva === config.key)
            if (kpis.length === 0) return null
            return <PerspectivaCard key={config.key} config={config} kpis={kpis} data={data} />
          })}
        </div>
      )}
    </div>
  )
}
