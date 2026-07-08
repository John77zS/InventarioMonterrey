import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen" },
        { status: 400 }
      )
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]

    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes JPG, PNG o WEBP" },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen no debe superar los 5 MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split(".").pop() || "jpg"
    const nombreArchivo = `evidencia-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`

    const carpetaUploads = path.join(
      process.cwd(),
      "public",
      "uploads",
      "evidencias"
    )

    await mkdir(carpetaUploads, { recursive: true })

    const rutaArchivo = path.join(carpetaUploads, nombreArchivo)

    await writeFile(rutaArchivo, buffer)

    const url = `/uploads/evidencias/${nombreArchivo}`

    return NextResponse.json({
      url,
      nombreArchivo,
    })
  } catch (error) {
    console.error("Error al subir evidencia:", error)

    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    )
  }
}