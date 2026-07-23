import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function limpiarTexto(valor: unknown) {
  if (typeof valor !== "string") return ""
  return valor.trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const nombre = limpiarTexto(body.nombre)
    const usuario = limpiarTexto(body.usuario).toLowerCase()
    const correo = limpiarTexto(body.correo)
    const password = limpiarTexto(body.password)

    if (!nombre || !usuario || !password) {
      return NextResponse.json(
        { error: "Nombre, usuario y contraseña son obligatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { usuario },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ese usuario ya existe" },
        { status: 400 }
      )
    }

    const solicitudExistente = await prisma.solicitudUsuario.findUnique({
      where: { usuario },
    })

    if (solicitudExistente) {
      return NextResponse.json(
        { error: "Ya existe una solicitud con ese usuario" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const solicitud = await prisma.solicitudUsuario.create({
      data: {
        nombre,
        usuario,
        correo: correo || null,
        passwordHash,
        estado: "PENDIENTE",
      },
    })

    return NextResponse.json(
      {
        message: "Solicitud enviada correctamente",
        solicitud: {
          id: solicitud.id,
          nombre: solicitud.nombre,
          usuario: solicitud.usuario,
          correo: solicitud.correo,
          estado: solicitud.estado,
          fechaSolicitud: solicitud.fechaSolicitud,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear solicitud de usuario:", error)

    return NextResponse.json(
      { error: "Error al enviar la solicitud" },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const solicitudes = await prisma.solicitudUsuario.findMany({
      orderBy: {
        fechaSolicitud: "desc",
      },
      include: {
        revisadoPor: {
          select: {
            usuario: true,
          },
        },
      },
    })

    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error("Error al obtener solicitudes:", error)

    return NextResponse.json(
      { error: "Error al obtener solicitudes" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const id = Number(body.id)
    const accion = limpiarTexto(body.accion)
    const rolAsignado = limpiarTexto(body.rolAsignado)
    const motivoRechazo = limpiarTexto(body.motivoRechazo)

    if (!id || !accion) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      )
    }

    const solicitud = await prisma.solicitudUsuario.findUnique({
      where: {
        id,
      },
    })

    if (!solicitud) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      )
    }

    if (solicitud.estado !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Esta solicitud ya fue revisada" },
        { status: 400 }
      )
    }

    const adminId = Number(session.user.id)

    if (accion === "RECHAZAR") {
      const actualizada = await prisma.solicitudUsuario.update({
        where: {
          id,
        },
        data: {
          estado: "RECHAZADA",
          motivoRechazo: motivoRechazo || "Solicitud rechazada por el administrador",
          fechaRevision: new Date(),
          revisadoPorId: adminId,
        },
      })

      return NextResponse.json(actualizada)
    }

    if (accion !== "APROBAR") {
      return NextResponse.json(
        { error: "Acción no válida" },
        { status: 400 }
      )
    }

    if (!["ADMIN", "OPERADOR", "CONSULTA"].includes(rolAsignado)) {
      return NextResponse.json(
        { error: "Debes asignar un rol válido" },
        { status: 400 }
      )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        usuario: solicitud.usuario,
      },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ese usuario ya existe" },
        { status: 400 }
      )
    }

    const tipoUsuario = await prisma.tipoUsuario.upsert({
      where: {
        rol: rolAsignado as "ADMIN" | "OPERADOR" | "CONSULTA",
      },
      update: {},
      create: {
        rol: rolAsignado as "ADMIN" | "OPERADOR" | "CONSULTA",
      },
    })

    await prisma.usuario.create({
      data: {
        idTipoUsuario: tipoUsuario.id,
        usuario: solicitud.usuario,
        password: solicitud.passwordHash,
        estado: "ACTIVO",
      },
    })

    const actualizada = await prisma.solicitudUsuario.update({
      where: {
        id,
      },
      data: {
        estado: "APROBADA",
        rolAsignado: rolAsignado as "ADMIN" | "OPERADOR" | "CONSULTA",
        fechaRevision: new Date(),
        revisadoPorId: adminId,
      },
    })

    return NextResponse.json(actualizada)
  } catch (error) {
    console.error("Error al revisar solicitud:", error)

    return NextResponse.json(
      { error: "Error al revisar la solicitud" },
      { status: 500 }
    )
  }
}