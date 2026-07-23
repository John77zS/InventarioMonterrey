import { prisma } from "@/lib/prisma";

export type RolSistema = "ADMIN" | "VENDEDOR" | "OPERADOR" | "CONSULTA";

type UsuarioSesion = {
  id?: string | number;
  usuario?: string;
  name?: string | null;
};

export type AccesoEventos = {
  idUsuario: number;
  rol: RolSistema;
  puedeGestionar: boolean;
};

const ROLES_GESTION_EVENTOS = new Set<RolSistema>(["ADMIN", "OPERADOR"]);

export async function obtenerAccesoEventos(
  session: unknown,
): Promise<AccesoEventos | null> {
  const usuarioSesion = (session as { user?: UsuarioSesion })?.user;
  const id = Number(usuarioSesion?.id);

  const seleccionarAcceso = {
    id: true,
    tipoUsuario: {
      select: {
        rol: true,
      },
    },
  } as const;

  let usuario: {
    id: number;
    tipoUsuario: {
      rol: RolSistema;
    };
  } | null = null;

  if (Number.isInteger(id) && id > 0) {
    usuario = await prisma.usuario.findFirst({
      where: {
        id,
        estado: "ACTIVO",
      },
      select: seleccionarAcceso,
    });
  }

  if (!usuario) {
    const nombreUsuario = usuarioSesion?.usuario || usuarioSesion?.name;

    if (!nombreUsuario) return null;

    usuario = await prisma.usuario.findFirst({
      where: {
        usuario: nombreUsuario,
        estado: "ACTIVO",
      },
      select: seleccionarAcceso,
    });
  }

  if (!usuario) return null;

  const rol = usuario.tipoUsuario.rol;

  return {
    idUsuario: usuario.id,
    rol,
    puedeGestionar: ROLES_GESTION_EVENTOS.has(rol),
  };
}

export function respuestaPermisosEventos(acceso: AccesoEventos) {
  return {
    rol: acceso.rol,
    puedeGestionar: acceso.puedeGestionar,
    soloLectura: !acceso.puedeGestionar,
  };
}