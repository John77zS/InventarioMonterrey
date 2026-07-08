import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const RUTAS_POR_ROL: Record<string, string[]> = {
  ADMIN: [
    "/dashboard",
    "/productos",
    "/categoria",
    "/inventario",
    "/proveedores",
    "/compras",
    "/clientes",
    "/ventas",
    "/reportes",
    "/configuracion",
  ],

  OPERADOR: [
    "/dashboard",
    "/productos",
    "/inventario",
    "/compras",
    "/ventas",
  ],

  CONSULTA: [
    "/dashboard",
    "/productos",
    "/reportes",
  ],
}

function rutaPermitida(pathname: string, rutasPermitidas: string[]) {
  return rutasPermitidas.some(
    (ruta) => pathname === ruta || pathname.startsWith(ruta + "/")
  )
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const rol = String(req.nextauth.token?.rol || "")

    const rutasPermitidas = RUTAS_POR_ROL[rol] || []

    if (!rutaPermitida(pathname, rutasPermitidas)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/productos/:path*",
    "/categoria/:path*",
    "/inventario/:path*",
    "/proveedores/:path*",
    "/compras/:path*",
    "/clientes/:path*",
    "/ventas/:path*",
    "/reportes/:path*",
    "/configuracion/:path*",
  ],
}