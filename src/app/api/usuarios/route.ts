import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

type RolPermitido = "ADMIN" | "OPERADOR" | "CONSULTA"

function limpiarTexto(valor: unknown) {
  if (typeof valor !== "string") return ""
  return valor.trim()
}

async function validarAdmin() {
  const session = await getServerSession(authOptions)

  if (session?.user?.rol !== "ADMIN") {
    return null
  }

  return session
}

async function obtenerTipoUsuario(rol: RolPermitido) {
  return prisma.tipoUsuario.upsert({
    where: {
      rol,
    },
    update: {},
    create: {
      rol,
    },
  })
}

export async function GET() {
  try {
    const session = await validarAdmin()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        tipoUsuario: true,
      },
    })

    return NextResponse.json(
      usuarios.map((usuario) => ({
        id: usuario.id,
        usuario: usuario.usuario,
        estado: usuario.estado,
        rol: usuario.tipoUsuario.rol,
      }))
    )
  } catch (error) {
    console.error("Error al obtener usuarios:", error)

    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await validarAdmin()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const usuario = limpiarTexto(body.usuario).toLowerCase()
    const password = limpiarTexto(body.password)
    const rol = limpiarTexto(body.rol) as RolPermitido

    if (!usuario || !password || !rol) {
      return NextResponse.json(
        { error: "Usuario, contraseña y rol son obligatorios" },
        { status: 400 }
      )
    }

    if (!["ADMIN", "OPERADOR", "CONSULTA"].includes(rol)) {
      return NextResponse.json(
        { error: "Rol no válido" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const existe = await prisma.usuario.findUnique({
      where: {
        usuario,
      },
    })

    if (existe) {
      return NextResponse.json(
        { error: "Ese usuario ya existe" },
        { status: 400 }
      )
    }

    const tipoUsuario = await obtenerTipoUsuario(rol)

    const nuevo = await prisma.usuario.create({
      data: {
        usuario,
        password: await bcrypt.hash(password, 10),
        estado: "ACTIVO",
        idTipoUsuario: tipoUsuario.id,
      },
      include: {
        tipoUsuario: true,
      },
    })

    return NextResponse.json(
      {
        id: nuevo.id,
        usuario: nuevo.usuario,
        estado: nuevo.estado,
        rol: nuevo.tipoUsuario.rol,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)

    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await validarAdmin()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const id = Number(body.id)
    const rol = limpiarTexto(body.rol) as RolPermitido
    const estado = limpiarTexto(body.estado)
    const password = limpiarTexto(body.password)

    if (!id) {
      return NextResponse.json(
        { error: "Usuario no válido" },
        { status: 400 }
      )
    }

    const data: {
      idTipoUsuario?: number
      estado?: "ACTIVO" | "INACTIVO"
      password?: string
    } = {}

    if (rol) {
      if (!["ADMIN", "OPERADOR", "CONSULTA"].includes(rol)) {
        return NextResponse.json(
          { error: "Rol no válido" },
          { status: 400 }
        )
      }

      const tipoUsuario = await obtenerTipoUsuario(rol)
      data.idTipoUsuario = tipoUsuario.id
    }

    if (estado) {
      if (!["ACTIVO", "INACTIVO"].includes(estado)) {
        return NextResponse.json(
          { error: "Estado no válido" },
          { status: 400 }
        )
      }

      data.estado = estado as "ACTIVO" | "INACTIVO"
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        )
      }

      data.password = await bcrypt.hash(password, 10)
    }

    const actualizado = await prisma.usuario.update({
      where: {
        id,
      },
      data,
      include: {
        tipoUsuario: true,
      },
    })

    return NextResponse.json({
      id: actualizado.id,
      usuario: actualizado.usuario,
      estado: actualizado.estado,
      rol: actualizado.tipoUsuario.rol,
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)

    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}