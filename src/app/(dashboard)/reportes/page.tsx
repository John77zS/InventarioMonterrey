"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Boxes,
  FileSpreadsheet,
  FileText,
  Package,
  PackageX,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  descargarCSV,
  descargarExcelHTML,
  imprimirReportePDF,
  type ExportSection,
} from "@/lib/exportaciones"

type Producto = {
  id: number
  codigo?: string | null
  nombreProducto: string
  unidadMedida?: string | null
  ubicacion?: string | null
  stock: number
  stockMinimo: number
  costo?: number | string | null
  estado?: string | null
  categoria?: {
    nombreCategoria: string
  } | null
}

type DetalleSalida = {
  id: number
  cantidad: number
  subtotal?: number | string | null
  producto?: {
    id: number
    codigo?: string | null
    nombreProducto: string
    unidadMedida?: string | null
  }
}

type Salida = {
  id: number
  fecha: string
  total?: number | string | null
  estado: string
  cliente?: {
    id: number
    nombre: string
    apPaterno?: string | null
  }
  detalles?: DetalleSalida[]
}

type EntradaDetalle = {
  id?: number
  cantidad?: number
  cantidadCompra?: number
  subtotal?: number | string | null
  producto?: {
    nombreProducto?: string | null
  }
}

type Entrada = {
  id: number
  fecha?: string
  fechaCompra?: string
  total?: number | string | null
  estado?: string | null
  proveedor?: {
    nombre?: string | null
    nombreProveedor?: string | null
    razonSocial?: string | null
  }
  detalles?: EntradaDetalle[]
  detalleCompra?: EntradaDetalle[]
  detallesCompra?: EntradaDetalle[]
}

function numero(valor: unknown) {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function moneda(valor: unknown) {
  return `Bs. ${numero(valor).toFixed(2)}`
}

function fecha(valor?: string | null) {
  if (!valor) return "-"

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor))
}

function detallesEntrada(entrada: Entrada) {
  if (Array.isArray(entrada.detalles)) return entrada.detalles
  if (Array.isArray(entrada.detalleCompra)) return entrada.detalleCompra
  if (Array.isArray(entrada.detallesCompra)) return entrada.detallesCompra

  return []
}

function proveedorNombre(entrada: Entrada) {
  return (
    entrada.proveedor?.nombre ||
    entrada.proveedor?.nombreProveedor ||
    entrada.proveedor?.razonSocial ||
    "Sin proveedor"
  )
}

function cantidadEntrada(detalle: EntradaDetalle) {
  return numero(detalle.cantidad || detalle.cantidadCompra || 0)
}
function nombreMaterialEntrada(detalle: EntradaDetalle) {
  return detalle.producto?.nombreProducto || "Material sin nombre"
}

export default function ReportesPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [salidas, setSalidas] = useState<Salida[]>([])
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)

  const cargarReportes = useCallback(async () => {
    try {
      setLoading(true)

      const [resProductos, resSalidas, resEntradas] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/ventas"),
        fetch("/api/compras"),
      ])

      const productosData = await resProductos.json()
      const salidasData = await resSalidas.json()
      const entradasData = await resEntradas.json()

      setProductos(Array.isArray(productosData) ? productosData : [])
      setSalidas(Array.isArray(salidasData) ? salidasData : [])
      setEntradas(Array.isArray(entradasData) ? entradasData : [])
    } catch {
      toast.error("Error al cargar reportes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  const productosActivos = useMemo(
    () => productos.filter((p) => p.estado !== "INACTIVO"),
    [productos]
  )

  const stockBajo = useMemo(
    () =>
      productosActivos.filter(
        (p) => numero(p.stock) > 0 && numero(p.stock) <= numero(p.stockMinimo)
      ),
    [productosActivos]
  )

  const sinStock = useMemo(
    () => productosActivos.filter((p) => numero(p.stock) <= 0),
    [productosActivos]
  )

  const salidasCompletadas = useMemo(
    () => salidas.filter((s) => s.estado !== "ANULADA"),
    [salidas]
  )

  const entradasActivas = useMemo(
    () =>
      entradas.filter(
        (e) => e.estado !== "ANULADA" && e.estado !== "INACTIVO"
      ),
    [entradas]
  )

  const valorInventario = useMemo(
    () =>
      productosActivos.reduce(
        (acc, p) => acc + numero(p.stock) * numero(p.costo),
        0
      ),
    [productosActivos]
  )

  const totalUnidadesStock = useMemo(
    () => productosActivos.reduce((acc, p) => acc + numero(p.stock), 0),
    [productosActivos]
  )

  const unidadesEntregadas = useMemo(
    () =>
      salidasCompletadas.reduce(
        (acc, salida) =>
          acc +
          (salida.detalles || []).reduce(
            (sum, detalle) => sum + numero(detalle.cantidad),
            0
          ),
        0
      ),
    [salidasCompletadas]
  )

  const topMateriales = useMemo(() => {
    const mapa = new Map<
      string,
      {
        material: string
        cantidad: number
        valor: number
      }
    >()

    for (const salida of salidasCompletadas) {
      for (const detalle of salida.detalles || []) {
        const nombre = detalle.producto?.nombreProducto || "Material sin nombre"

        const actual = mapa.get(nombre) || {
          material: nombre,
          cantidad: 0,
          valor: 0,
        }

        actual.cantidad += numero(detalle.cantidad)
        actual.valor += numero(detalle.subtotal)

        mapa.set(nombre, actual)
      }
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10)
  }, [salidasCompletadas])

  const topAreas = useMemo(() => {
    const mapa = new Map<
      string,
      {
        area: string
        responsable: string
        salidas: number
        unidades: number
      }
    >()

    for (const salida of salidasCompletadas) {
      const area = salida.cliente?.nombre || "Sin área"
      const responsable = salida.cliente?.apPaterno || "Sin responsable"
      const key = `${area}-${responsable}`

      const unidades = (salida.detalles || []).reduce(
        (acc, detalle) => acc + numero(detalle.cantidad),
        0
      )

      const actual = mapa.get(key) || {
        area,
        responsable,
        salidas: 0,
        unidades: 0,
      }

      actual.salidas += 1
      actual.unidades += unidades

      mapa.set(key, actual)
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 10)
  }, [salidasCompletadas])

  const resumen = {
    materiales: productosActivos.length,
    unidadesStock: totalUnidadesStock,
    stockBajo: stockBajo.length,
    sinStock: sinStock.length,
    entradas: entradasActivas.length,
    salidas: salidasCompletadas.length,
    unidadesEntregadas,
    valorInventario,
  }
    function crearSeccionesReporte(): ExportSection[] {
    const alertas = [...stockBajo, ...sinStock]

    return [
      {
        titulo: "Stock actual",
        columnas: [
          "Código",
          "Material",
          "Categoría",
          "Unidad",
          "Ubicación",
          "Stock",
          "Mínimo",
          "Estado",
        ],
        filas: productosActivos.map((producto) => {
          const stock = numero(producto.stock)
          const minimo = numero(producto.stockMinimo)

          const estado =
            stock <= 0
              ? "Sin stock"
              : stock <= minimo
                ? "Stock bajo"
                : "Disponible"

          return [
            producto.codigo || "Sin código",
            producto.nombreProducto,
            producto.categoria?.nombreCategoria || "Sin categoría",
            producto.unidadMedida || "Unidad",
            producto.ubicacion || "Sin ubicación",
            stock,
            minimo,
            estado,
          ]
        }),
      },
      {
        titulo: "Alertas de stock",
        columnas: ["Material", "Código", "Stock", "Mínimo", "Alerta"],
        filas: alertas.map((producto) => [
          producto.nombreProducto,
          producto.codigo || "Sin código",
          numero(producto.stock),
          numero(producto.stockMinimo),
          numero(producto.stock) <= 0 ? "Sin stock" : "Stock bajo",
        ]),
      },
      {
        titulo: "Entradas de material",
        columnas: [
          "Fecha",
          "Proveedor",
          "Material ingresado",
          "Cantidad ingresada",
          "Valor ref. entrada",
        ],
        filas: entradasActivas.flatMap((entrada) => {
          const detalles = detallesEntrada(entrada)

          if (detalles.length === 0) {
            return [
              [
                fecha(entrada.fecha || entrada.fechaCompra),
                proveedorNombre(entrada),
                "Sin material registrado",
                0,
                moneda(entrada.total),
              ],
            ]
          }

          return detalles.map((detalle) => [
            fecha(entrada.fecha || entrada.fechaCompra),
            proveedorNombre(entrada),
            nombreMaterialEntrada(detalle),
            cantidadEntrada(detalle),
            moneda(entrada.total),
          ])
        }),
      },
            {
        titulo: "Salidas de material",
        columnas: [
          "Fecha",
          "Área solicitante",
          "Responsable",
          "Material retirado",
          "Cantidad retirada",
          "Valor ref. salida",
        ],
        filas: salidasCompletadas.flatMap((salida) => {
          const detalles = salida.detalles || []

          if (detalles.length === 0) {
            return [
              [
                fecha(salida.fecha),
                salida.cliente?.nombre || "Sin área",
                salida.cliente?.apPaterno || "Sin responsable",
                "Sin material registrado",
                0,
                moneda(salida.total),
              ],
            ]
          }

          return detalles.map((detalle) => [
            fecha(salida.fecha),
            salida.cliente?.nombre || "Sin área",
            salida.cliente?.apPaterno || "Sin responsable",
            detalle.producto?.nombreProducto || "Material sin nombre",
            numero(detalle.cantidad),
            moneda(detalle.subtotal),
          ])
        }),
      },
      {
        titulo: "Materiales más entregados",
        columnas: ["Material", "Cantidad entregada", "Valor referencial"],
        filas: topMateriales.map((item) => [
          item.material,
          item.cantidad,
          moneda(item.valor),
        ]),
      },
      {
        titulo: "Áreas solicitantes con más entregas",
        columnas: ["Área", "Responsable", "Salidas", "Unidades entregadas"],
        filas: topAreas.map((item) => [
          item.area,
          item.responsable,
          item.salidas,
          item.unidades,
        ]),
      },
    ]
  }
  function exportarExcel() {
    descargarExcelHTML(
      "reporte-completo-inventario-mkt",
      "Reporte Completo de Inventario MKT",
      crearSeccionesReporte()
    )
  }

  function exportarPDF() {
    imprimirReportePDF(
      "Reporte Completo de Inventario MKT",
      crearSeccionesReporte()
    )
  }

  function exportarStockCSV() {
    const seccionStock = crearSeccionesReporte()[0]

    descargarCSV(
      "stock-actual-inventario-mkt",
      seccionStock.columnas,
      seccionStock.filas
    )
  }

  function exportarInventarioActual() {
    const secciones = crearSeccionesReporte()

    descargarExcelHTML(
      "inventario-actual-mkt",
      "Inventario Actual MKT",
      [secciones[0]]
    )
  }

  function exportarAlertasStock() {
    const secciones = crearSeccionesReporte()

    descargarExcelHTML(
      "alertas-stock-mkt",
      "Alertas de Stock MKT",
      [secciones[1]]
    )
  }

  function exportarEntradasSalidas() {
    const secciones = crearSeccionesReporte()

    descargarExcelHTML(
      "entradas-salidas-mkt",
      "Entradas y Salidas de Material",
      [secciones[2], secciones[3]]
    )
  }

  function exportarMaterialesEntregados() {
    const secciones = crearSeccionesReporte()

    descargarExcelHTML(
      "materiales-mas-entregados-mkt",
      "Materiales Más Entregados",
      [secciones[4]]
    )
  }

  function exportarResumenAreas() {
    const secciones = crearSeccionesReporte()

    descargarExcelHTML(
      "resumen-por-area-mkt",
      "Resumen por Área Solicitante",
      [secciones[5]]
    )
  }
    return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Inventario MKT
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Reportes de Inventario
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Consulta stock actual, alertas, entradas, salidas y materiales más entregados.
            </p>
          </div>
        </div>
      </div>
            <div className="space-y-5 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Exportar datos
          </h2>

          <p className="text-sm text-slate-500">
            Descarga reportes específicos o genera un reporte completo del inventario.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:grid-cols-5">
          <div>
            <p className="text-xl font-bold text-red-600">
              {resumen.materiales}
            </p>
            <p className="text-xs text-slate-600">
              Materiales
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-red-600">
              {resumen.entradas + resumen.salidas}
            </p>
            <p className="text-xs text-slate-600">
              Eventos registrados
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-red-600">
              {resumen.entradas}
            </p>
            <p className="text-xs text-slate-600">
              Entradas
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-red-600">
              {resumen.salidas}
            </p>
            <p className="text-xs text-slate-600">
              Salidas
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-red-600">
              {resumen.unidadesEntregadas}
            </p>
            <p className="text-xs text-slate-600">
              Total entregado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-red-100 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Package className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Inventario actual
              </CardTitle>

              <p className="text-sm text-slate-500">
                Lista completa de materiales con código, stock, mínimos y ubicación.
              </p>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                onClick={exportarInventarioActual}
                disabled={loading}
                className="w-full bg-red-600 text-white hover:bg-red-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-100 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Alertas de stock
              </CardTitle>

              <p className="text-sm text-slate-500">
                Materiales con stock bajo o sin stock para reposición.
              </p>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                onClick={exportarAlertasStock}
                disabled={loading}
                className="w-full bg-yellow-500 text-white hover:bg-yellow-600"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ArrowDown className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Entradas y salidas
              </CardTitle>

              <p className="text-sm text-slate-500">
                Resumen de ingresos y entregas de material registradas.
              </p>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                onClick={exportarEntradasSalidas}
                disabled={loading}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Materiales más entregados
              </CardTitle>

              <p className="text-sm text-slate-500">
                Ranking de materiales con mayor cantidad entregada.
              </p>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                onClick={exportarMaterialesEntregados}
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Users className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Resumen por área
              </CardTitle>

              <p className="text-sm text-slate-500">
                Cantidad entregada y número de salidas por área solicitante.
              </p>
            </CardHeader>

            <CardContent>
              <Button
                type="button"
                onClick={exportarResumenAreas}
                disabled={loading}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>

              <CardTitle className="text-base">
                Reporte completo
              </CardTitle>

              <p className="text-sm text-slate-500">
                Inventario, alertas, entradas, salidas, top materiales y áreas.
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={exportarExcel}
                disabled={loading}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Descargar Excel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={exportarPDF}
                disabled={loading}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={exportarStockCSV}
                disabled={loading}
                className="w-full"
              >
                Stock CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Materiales
            </CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.materiales}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiales activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Unidades en stock
            </CardTitle>
            <Boxes className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.unidadesStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Existencia total
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Stock bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {resumen.stockBajo}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Sin stock
            </CardTitle>
            <PackageX className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {resumen.sinStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiales agotados
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Entradas
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-green-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.entradas}
            </div>
            <p className="text-xs text-muted-foreground">
              Registros de ingreso
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Salidas
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.salidas}
            </div>
            <p className="text-xs text-muted-foreground">
              Entregas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Unidades entregadas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumen.unidadesEntregadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Total retirado
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Valor inventario
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {moneda(resumen.valorInventario)}
            </div>
            <p className="text-xs text-muted-foreground">
              Costo referencial
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="stock">
            Stock actual
          </TabsTrigger>

          <TabsTrigger value="bajo">
            Stock bajo
          </TabsTrigger>

          <TabsTrigger value="entradas">
            Entradas
          </TabsTrigger>

          <TabsTrigger value="salidas">
            Salidas
          </TabsTrigger>

          <TabsTrigger value="top">
            Más entregados
          </TabsTrigger>

          <TabsTrigger value="areas">
            Áreas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Stock actual
            </h2>

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Cargando reporte...
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {productosActivos.map((producto) => {
                      const stock = numero(producto.stock)
                      const minimo = numero(producto.stockMinimo)

                      return (
                        <TableRow key={producto.id}>
                          <TableCell>
                            {producto.codigo || "Sin código"}
                          </TableCell>

                          <TableCell className="font-medium">
                            {producto.nombreProducto}
                          </TableCell>

                          <TableCell>
                            {producto.categoria?.nombreCategoria || "Sin categoría"}
                          </TableCell>

                          <TableCell>
                            {producto.unidadMedida || "Unidad"}
                          </TableCell>

                          <TableCell>
                            {producto.ubicacion || "Sin ubicación"}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {stock}
                          </TableCell>

                          <TableCell className="text-right">
                            {minimo}
                          </TableCell>

                          <TableCell>
                            {stock <= 0 ? (
                              <Badge className="bg-red-600">
                                Sin stock
                              </Badge>
                            ) : stock <= minimo ? (
                              <Badge className="bg-yellow-500">
                                Stock bajo
                              </Badge>
                            ) : (
                              <Badge className="bg-green-600">
                                Disponible
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bajo">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Materiales con alerta de stock
            </h2>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead>Alerta</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {[...stockBajo, ...sinStock].map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">
                        {producto.nombreProducto}
                      </TableCell>

                      <TableCell>
                        {producto.codigo || "Sin código"}
                      </TableCell>

                      <TableCell className="text-right">
                        {producto.stock}
                      </TableCell>

                      <TableCell className="text-right">
                        {producto.stockMinimo}
                      </TableCell>

                      <TableCell>
                        {numero(producto.stock) <= 0 ? (
                          <Badge className="bg-red-600">
                            Sin stock
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500">
                            Stock bajo
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {stockBajo.length === 0 && sinStock.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay materiales con stock bajo o agotado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entradas">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Entradas de material
            </h2>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Materiales</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Valor ref.</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {entradasActivas.map((entrada) => {
                    const detalles = detallesEntrada(entrada)

                    const unidades = detalles.reduce(
                      (acc, detalle) => acc + cantidadEntrada(detalle),
                      0
                    )

                    return (
                      <TableRow key={entrada.id}>
                        <TableCell>
                          {fecha(entrada.fecha || entrada.fechaCompra)}
                        </TableCell>

                        <TableCell>
                          {proveedorNombre(entrada)}
                        </TableCell>

                        <TableCell className="text-right">
                          {detalles.length}
                        </TableCell>

                        <TableCell className="text-right">
                          {unidades}
                        </TableCell>

                        <TableCell className="text-right">
                          {moneda(entrada.total)}
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {entradasActivas.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay entradas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="salidas">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Salidas de material
            </h2>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Área solicitante</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="text-right">Materiales</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Valor ref.</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {salidasCompletadas.map((salida) => {
                    const unidades = (salida.detalles || []).reduce(
                      (acc, detalle) => acc + numero(detalle.cantidad),
                      0
                    )

                    return (
                      <TableRow key={salida.id}>
                        <TableCell>
                          {fecha(salida.fecha)}
                        </TableCell>

                        <TableCell>
                          {salida.cliente?.nombre || "Sin área"}
                        </TableCell>

                        <TableCell>
                          {salida.cliente?.apPaterno || "Sin responsable"}
                        </TableCell>

                        <TableCell className="text-right">
                          {(salida.detalles || []).length}
                        </TableCell>

                        <TableCell className="text-right">
                          {unidades}
                        </TableCell>

                        <TableCell className="text-right">
                          {moneda(salida.total)}
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {salidasCompletadas.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay salidas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="top">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Materiales más entregados
            </h2>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">
                      Cantidad entregada
                    </TableHead>
                    <TableHead className="text-right">
                      Valor referencial
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {topMateriales.map((item) => (
                    <TableRow key={item.material}>
                      <TableCell className="font-medium">
                        {item.material}
                      </TableCell>

                      <TableCell className="text-right">
                        {item.cantidad}
                      </TableCell>

                      <TableCell className="text-right">
                        {moneda(item.valor)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {topMateriales.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Todavía no hay materiales entregados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="areas">
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-red-600" />
              Áreas solicitantes con más entregas
            </h2>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Área</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="text-right">Salidas</TableHead>
                    <TableHead className="text-right">
                      Unidades entregadas
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {topAreas.map((item) => (
                    <TableRow key={`${item.area}-${item.responsable}`}>
                      <TableCell className="font-medium">
                        {item.area}
                      </TableCell>

                      <TableCell>
                        {item.responsable}
                      </TableCell>

                      <TableCell className="text-right">
                        {item.salidas}
                      </TableCell>

                      <TableCell className="text-right">
                        {item.unidades}
                      </TableCell>
                    </TableRow>
                  ))}

                  {topAreas.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Todavía no hay áreas con salidas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
