import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      usuario: string
      rol: string
      idTipoUsuario: number
    }
  }

  interface User {
    id: number
    usuario: string
    rol: string
    idTipoUsuario: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    usuario: string
    rol: string
    idTipoUsuario: number
  }
}
