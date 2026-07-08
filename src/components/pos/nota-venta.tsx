"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export type VentaConDetalles = {
  id: number
  fecha: string
  cliente: {
    nombre: string
    apPaterno: string
    apMaterno?: string | null
  }
  usuario: { usuario: string }
  tipoPago: { tipoMetodo: string }
  subtotal: number | string
  total: number | string
  detalles: Array<{
    id: number
    cantidad: number
    precio: number | string
    subtotal: number | string
    producto: {
      nombreProducto: string
      talla: string
      color: string
    }
  }>
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta de crédito/débito",
  QR: "Pago QR",
}

function buildPrintHTML(venta: VentaConDetalles): string {
  const fecha = new Date(venta.fecha)
  const fechaStr = fecha.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const horaStr = fecha.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const clienteNombre = [
    venta.cliente.apPaterno,
    venta.cliente.apMaterno,
    venta.cliente.nombre,
  ]
    .filter(Boolean)
    .join(" ")

  const metodoLabel = METODO_LABEL[venta.tipoPago.tipoMetodo] ?? venta.tipoPago.tipoMetodo

  const itemsHTML = venta.detalles
    .map(
      (d) => `
      <tr>
        <td>${d.producto.nombreProducto}<br>
          <small>Talla: ${d.producto.talla} · ${d.producto.color}</small>
        </td>
        <td class="center">${d.cantidad}</td>
        <td class="right">Bs.&nbsp;${Number(d.precio).toFixed(2)}</td>
        <td class="right">Bs.&nbsp;${Number(d.subtotal).toFixed(2)}</td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nota de Venta #${venta.id} — CambaClothes</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 5mm 4mm;
    }
    @media print {
      html, body { margin: 0; padding: 0; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', 'Lucida Console', monospace;
      font-size: 11px;
      color: #111;
      background: #fff;
      width: 72mm;
      margin: 0 auto;
      padding: 4px 0;
    }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: bold; }
    .dashed {
      border: none;
      border-top: 1px dashed #999;
      margin: 6px 0;
    }
    .header-title {
      font-size: 17px;
      font-weight: bold;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header-sub { font-size: 10px; color: #555; margin-bottom: 1px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 2.5px 0;
      font-size: 10.5px;
    }
    .info-label { color: #555; }
    .info-value { font-weight: 600; text-align: right; max-width: 55%; word-break: break-word; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    thead th {
      font-size: 9.5px;
      padding: 3px 2px;
      text-align: left;
      border-bottom: 1px solid #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th.center { text-align: center; }
    thead th.right  { text-align: right; }
    tbody td {
      font-size: 10px;
      padding: 4px 2px;
      vertical-align: top;
      border-bottom: 1px dashed #ddd;
    }
    tbody td.center { text-align: center; }
    tbody td.right  { text-align: right; white-space: nowrap; }
    tbody td small  { font-size: 9px; color: #666; }
    .totals { margin: 4px 0; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin: 2px 0;
    }
    .total-final {
      font-size: 14px;
      font-weight: bold;
      border-top: 1px solid #333;
      padding-top: 4px;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px dashed #aaa;
      color: #555;
    }
    .footer strong { display: block; font-size: 11px; color: #111; margin-bottom: 2px; }
  </style>
</head>
<body>
  <div class="center" style="margin-bottom:10px">
    <div class="header-title">CambaClothes</div>
    <div class="header-sub">Boutique de Ropa — Santa Cruz, Bolivia</div>
    <div class="header-sub">&#9472;&#9472;&#9472; Nota de Venta &#9472;&#9472;&#9472;</div>
  </div>

  <div class="info-row">
    <span class="info-label">N° Venta:</span>
    <span class="info-value bold">#${venta.id}</span>
  </div>
  <div class="info-row">
    <span class="info-label">Fecha:</span>
    <span class="info-value">${fechaStr} ${horaStr}</span>
  </div>
  <div class="info-row">
    <span class="info-label">Vendedor:</span>
    <span class="info-value">${venta.usuario.usuario}</span>
  </div>
  <div class="info-row">
    <span class="info-label">Cliente:</span>
    <span class="info-value">${clienteNombre}</span>
  </div>

  <hr class="dashed">

  <table>
    <thead>
      <tr>
        <th style="width:42%">Producto</th>
        <th class="center" style="width:12%">Cant.</th>
        <th class="right"  style="width:22%">P.Unit</th>
        <th class="right"  style="width:24%">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <hr class="dashed">

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>Bs. ${Number(venta.subtotal).toFixed(2)}</span>
    </div>
    <div class="total-row total-final">
      <span>TOTAL:</span>
      <span>Bs. ${Number(venta.total).toFixed(2)}</span>
    </div>
    <div class="total-row" style="margin-top:5px;font-size:10px">
      <span>Método de pago:</span>
      <span>${metodoLabel}</span>
    </div>
  </div>

  <div class="footer">
    <strong>&#x00A1;Gracias por su compra!</strong>
    Vuelva pronto &middot; CambaClothes
  </div>

  <script>
    window.addEventListener('load', function () {
      window.print()
    })
    window.addEventListener('afterprint', function () {
      window.close()
    })
  </script>
</body>
</html>`
}

type Props = {
  venta: VentaConDetalles
  onClose: () => void
}

export default function NotaVenta({ venta, onClose }: Props) {
  const fecha = new Date(venta.fecha)
  const fechaStr = fecha.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const horaStr = fecha.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const clienteNombre = [
    venta.cliente.apPaterno,
    venta.cliente.apMaterno,
    venta.cliente.nombre,
  ]
    .filter(Boolean)
    .join(" ")

  const metodoLabel = METODO_LABEL[venta.tipoPago.tipoMetodo] ?? venta.tipoPago.tipoMetodo

  function handlePrint() {
    const w = window.open("", "_blank", "width=440,height=720,toolbar=0,menubar=0,scrollbars=1")
    if (!w) {
      alert(
        "El navegador bloqueó la ventana emergente.\n" +
        "Por favor permite las ventanas emergentes (pop-ups) para este sitio e intenta nuevamente."
      )
      return
    }
    w.document.write(buildPrintHTML(venta))
    w.document.close()
  }

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.10)] overflow-hidden max-h-[56vh] overflow-y-auto">

        <div className="text-center py-4 px-5 bg-gray-50 border-b border-dashed">
          <p className="font-black text-[15px] tracking-[4px] uppercase font-mono">
            CambaClothes
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            Boutique de Ropa · Santa Cruz, Bolivia
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            ─── Nota de Venta ───
          </p>
        </div>

        <div className="font-mono text-[11px] px-5 py-3">
          <div className="space-y-0.5 mb-3">
            {(
              [
                ["N° Venta", `#${venta.id}`],
                ["Fecha", `${fechaStr}  ${horaStr}`],
                ["Vendedor", venta.usuario.usuario],
                ["Cliente", clienteNombre],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">{label}:</span>
                <span className="font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-2" />

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground border-b border-gray-300 pb-1 mb-1">
            <span>Producto</span>
            <span className="text-center">Cant.</span>
            <span className="text-right">P.Unit</span>
            <span className="text-right">Total</span>
          </div>

          <div className="divide-y divide-dashed divide-gray-100">
            {venta.detalles.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-1.5"
              >
                <div>
                  <p className="font-medium leading-tight">{d.producto.nombreProducto}</p>
                  <p className="text-[9px] text-muted-foreground">
                    T:{d.producto.talla} · {d.producto.color}
                  </p>
                </div>
                <span className="text-center self-start">{d.cantidad}</span>
                <span className="text-right self-start whitespace-nowrap">
                  Bs.{Number(d.precio).toFixed(2)}
                </span>
                <span className="text-right self-start font-semibold whitespace-nowrap">
                  Bs.{Number(d.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-2" />

          <div className="space-y-0.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>Bs. {Number(venta.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-base border-t border-gray-300 pt-1 mt-1">
              <span>TOTAL:</span>
              <span>Bs. {Number(venta.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
              <span>Pago:</span>
              <span>{metodoLabel}</span>
            </div>
          </div>
        </div>

        <div className="text-center font-mono text-[10px] text-muted-foreground bg-gray-50 border-t border-dashed py-3 px-4">
          <p className="font-semibold text-foreground text-[11px]">¡Gracias por su compra!</p>
          <p>Vuelva pronto · CambaClothes</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cerrar
        </Button>
        <Button className="flex-1" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>
    </div>
  )
}
