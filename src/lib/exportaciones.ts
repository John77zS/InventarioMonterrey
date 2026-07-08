export type ExportCell = string | number

export type ExportSection = {
  titulo: string
  columnas: string[]
  filas: ExportCell[][]
}

function limpiarTexto(valor: unknown) {
  return String(valor ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function descargarArchivo(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = nombreArchivo

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function tablaHTML(seccion: ExportSection) {
  const columnas = seccion.columnas
    .map((columna) => `<th>${limpiarTexto(columna)}</th>`)
    .join("")

  const filas = seccion.filas
    .map((fila) => {
      const celdas = fila
        .map((celda) => `<td>${limpiarTexto(celda)}</td>`)
        .join("")

      return `<tr>${celdas}</tr>`
    })
    .join("")

  return `
    <h2>${limpiarTexto(seccion.titulo)}</h2>

    <table>
      <thead>
        <tr>${columnas}</tr>
      </thead>

      <tbody>
        ${filas}
      </tbody>
    </table>
  `
}

export function descargarCSV(
  nombreArchivo: string,
  columnas: string[],
  filas: ExportCell[][]
) {
  const separador = ";"

  const encabezado = columnas
    .map((columna) => `"${limpiarTexto(columna)}"`)
    .join(separador)

  const contenidoFilas = filas
    .map((fila) =>
      fila
        .map((celda) => `"${limpiarTexto(celda).replace(/"/g, '""')}"`)
        .join(separador)
    )
    .join("\n")

  const contenido = `\uFEFF${encabezado}\n${contenidoFilas}`

  const blob = new Blob([contenido], {
    type: "text/csv;charset=utf-8;",
  })

  descargarArchivo(blob, `${nombreArchivo}.csv`)
}

export function descargarExcelHTML(
  nombreArchivo: string,
  titulo: string,
  secciones: ExportSection[]
) {
  const fecha = new Date().toLocaleString("es-BO")

  const contenido = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          body {
            font-family: Arial, sans-serif;
          }

          h1 {
            color: #b91c1c;
          }

          h2 {
            margin-top: 24px;
            color: #111827;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          th {
            background: #dc2626;
            color: #ffffff;
            font-weight: bold;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 12px;
          }
        </style>
      </head>

      <body>
        <h1>${limpiarTexto(titulo)}</h1>
        <p>Generado: ${fecha}</p>

        ${secciones.map(tablaHTML).join("")}
      </body>
    </html>
  `

  const blob = new Blob(["\uFEFF", contenido], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  })

  descargarArchivo(blob, `${nombreArchivo}.xls`)
}

export function imprimirReportePDF(
  titulo: string,
  secciones: ExportSection[]
) {
  const fecha = new Date().toLocaleString("es-BO")

  const contenido = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <title>${limpiarTexto(titulo)}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            padding: 24px;
          }

          h1 {
            color: #b91c1c;
            margin-bottom: 4px;
          }

          h2 {
            margin-top: 24px;
            color: #111827;
          }

          p {
            color: #6b7280;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }

          th {
            background: #dc2626;
            color: #ffffff;
            text-align: left;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 7px;
            font-size: 11px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <h1>${limpiarTexto(titulo)}</h1>
        <p>Generado: ${fecha}</p>

        ${secciones.map(tablaHTML).join("")}

        <script>
          window.onload = function () {
            window.print()
          }
        </script>
      </body>
    </html>
  `

  const ventana = window.open("", "_blank", "width=1100,height=800")

  if (!ventana) {
    alert("El navegador bloqueó la ventana emergente. Permite ventanas emergentes para exportar PDF.")
    return
  }

  ventana.document.open()
  ventana.document.write(contenido)
  ventana.document.close()
}