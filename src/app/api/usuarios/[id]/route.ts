import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { usuarioUpdateSchema } from '@/lib/validations/usuario'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.rol !== 'ADMIN') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  try {
    const { id } = await params
    const numId = Number(id)
    const body = await req.json()

    const result = usuarioUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const existe = await prisma.usuario.findFirst({
      where: { usuario: result.data.usuario, NOT: { id: numId } },
    })
    if (existe) {
      return NextResponse.json({ error: 'El nombre de usuario ya está en uso' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      usuario: result.data.usuario,
      idTipoUsuario: result.data.idTipoUsuario,
      estado: result.data.estado,
    }

    if (result.data.password && result.data.password.length > 0) {
      updateData.password = await bcrypt.hash(result.data.password, 10)
    }

    const usuario = await prisma.usuario.update({
      where: { id: numId },
      data: updateData,
    })

    const { password: _password, ...safe } = usuario
    return NextResponse.json(safe)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
