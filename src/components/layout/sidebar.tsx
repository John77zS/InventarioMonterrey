"use client"

import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ArrowUpDown,
  Truck,
  BarChart3,
  Settings,
  ClipboardList,
  Boxes,
  ArrowUpFromLine,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavLink = {
  kind: "link"
  href: string
  label: string
  icon: ElementType
  roles?: string[]
}

type NavSection = {
  kind: "section"
  label: string
  roles?: string[]
}

type NavEntry = NavLink | NavSection

const navEntries: NavEntry[] = [
  {
    kind: "link",
    href: "/dashboard",
    label: "Panel de Control",
    icon: LayoutDashboard,
    roles: ["ADMIN", "OPERADOR", "CONSULTA"],
  },

  { kind: "section", label: "Inventario", roles: ["ADMIN", "OPERADOR", "CONSULTA"] },
  {
    kind: "link",
    href: "/productos",
    label: "Materiales",
    icon: Package,
    roles: ["ADMIN", "OPERADOR", "CONSULTA"],
  },
  {
    kind: "link",
    href: "/categoria",
    label: "Categorías",
    icon: Tag,
    roles: ["ADMIN"],
  },
  {
    kind: "link",
    href: "/inventario",
    label: "Movimientos",
    icon: ArrowUpDown,
    roles: ["ADMIN", "OPERADOR"],
  },

  { kind: "section", label: "Abastecimiento", roles: ["ADMIN", "OPERADOR"] },
  {
    kind: "link",
    href: "/proveedores",
    label: "Proveedores",
    icon: Truck,
    roles: ["ADMIN"],
  },
  {
    kind: "link",
    href: "/compras",
    label: "Entradas de Material",
    icon: Boxes,
    roles: ["ADMIN", "OPERADOR"],
  },

  { kind: "section", label: "Solicitudes", roles: ["ADMIN", "OPERADOR", "CONSULTA"] },
  {
    kind: "link",
    href: "/clientes",
    label: "Áreas Solicitantes",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    kind: "link",
    href: "/ventas",
    label: "Salidas de Material",
    icon: ArrowUpFromLine,
    roles: ["ADMIN", "OPERADOR"],
  },
  {
    kind: "link",
    href: "/reportes",
    label: "Reportes de Inventario",
    icon: BarChart3,
    roles: ["ADMIN", "CONSULTA"],
  },

  { kind: "section", label: "Sistema", roles: ["ADMIN"] },
  {
    kind: "link",
    href: "/configuracion",
    label: "Configuración",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

function NavContent() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const rol = session?.user?.rol ?? ""

  const visible = navEntries.filter((entry) => !entry.roles || entry.roles.includes(rol))

  const filtered: NavEntry[] = []

  for (let i = 0; i < visible.length; i++) {
    const entry = visible[i]

    if (entry.kind === "section") {
      let hasNextLink = false

      for (let j = i + 1; j < visible.length; j++) {
        if (visible[j].kind === "section") break
        if (visible[j].kind === "link") {
          hasNextLink = true
          break
        }
      }

      if (hasNextLink) filtered.push(entry)
    } else {
      filtered.push(entry)
    }
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {filtered.map((entry, i) => {
        if (entry.kind === "section") {
          return (
            <p
              key={i}
              className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-500/70 first:pt-0"
            >
              {entry.label}
            </p>
          )
        }

        const isActive = pathname === entry.href || pathname.startsWith(entry.href + "/")

        return (
          <Link
            key={`${entry.href}-${entry.label}`}
            href={entry.href}
            className={cn(
              "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              isActive
                ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                : "text-slate-600 hover:bg-red-50 hover:text-red-700"
            )}
          >
            <entry.icon className="h-4 w-4 shrink-0" />
            {entry.label}
          </Link>
        )
      })}
    </nav>
  )
}

function BrandHeader() {
  return (
    <div className="border-b border-red-100 px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
          <ClipboardList className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-extrabold leading-none text-slate-900">
            Inventario MKT
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Materiales de Marketing
          </p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-red-100 bg-white md:flex">
      <BrandHeader />
      <NavContent />
    </aside>
  )
}

export function MobileSidebarContent() {
  return (
    <div className="flex h-full flex-col bg-white">
      <BrandHeader />
      <NavContent />
    </div>
  )
}
