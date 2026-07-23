"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  kind: "link";
  href: string;
  label: string;
  icon: ElementType;
  roles?: string[];
};

type NavSection = {
  kind: "section";
  label: string;
  roles?: string[];
};

type NavEntry = NavLink | NavSection;

const navEntries: NavEntry[] = [
  {
    kind: "link",
    href: "/dashboard",
    label: "Panel de Control",
    icon: LayoutDashboard,
    roles: ["ADMIN", "OPERADOR", "CONSULTA"],
  },

  {
    kind: "section",
    label: "Inventario",
    roles: ["ADMIN", "OPERADOR", "CONSULTA"],
  },
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

  {
    kind: "section",
    label: "Eventos",
    roles: ["ADMIN", "OPERADOR", "VENDEDOR", "CONSULTA"],
  },
  {
    kind: "link",
    href: "/eventos",
    label: "Gestión de Eventos",
    icon: CalendarDays,
    roles: ["ADMIN", "OPERADOR", "VENDEDOR", "CONSULTA"],
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

  {
    kind: "section",
    label: "Solicitudes",
    roles: ["ADMIN", "OPERADOR", "CONSULTA"],
  },
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
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rol = session?.user?.rol ?? "";

  const visible = navEntries.filter(
    (entry) => !entry.roles || entry.roles.includes(rol),
  );

  const filtered: NavEntry[] = [];

  for (let i = 0; i < visible.length; i++) {
    const entry = visible[i];

    if (entry.kind === "section") {
      let hasNextLink = false;

      for (let j = i + 1; j < visible.length; j++) {
        if (visible[j].kind === "section") break;
        if (visible[j].kind === "link") {
          hasNextLink = true;
          break;
        }
      }

      if (hasNextLink) filtered.push(entry);
    } else {
      filtered.push(entry);
    }
  }

  return (
    <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4">
      {filtered.map((entry, i) => {
        if (entry.kind === "section") {
          return (
            <p
              key={i}
              className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-red-500/70 first:pt-0 sm:px-3 sm:pb-2 sm:pt-5 sm:text-[11px] sm:tracking-[0.18em]"
            >
              {entry.label}
            </p>
          );
        }

        const isActive =
          pathname === entry.href || pathname.startsWith(entry.href + "/");

        return (
          <Link
            key={`${entry.href}-${entry.label}`}
            href={entry.href}
            onClick={onNavigate}
            className={cn(
              "mb-0.5 flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-all sm:mb-1 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm",
              isActive
                ? "bg-red-600 text-white shadow-sm shadow-red-600/20"
                : "text-slate-600 hover:bg-red-50 hover:text-red-700",
            )}
          >
            <entry.icon className="h-4 w-4 shrink-0" />
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandHeader() {
  return (
    <div className="border-b border-red-100 px-4 py-3 sm:px-5 sm:py-5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
          <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold leading-none text-slate-900">
            Inventario MKT
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-slate-500 sm:text-xs">
            Materiales de Marketing
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-dvh w-60 shrink-0 flex-col border-r border-red-100 bg-white lg:flex xl:w-64">
      <BrandHeader />
      <NavContent />
    </aside>
  );
}

export function MobileSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <BrandHeader />
      <NavContent onNavigate={onNavigate} />
    </div>
  );
}