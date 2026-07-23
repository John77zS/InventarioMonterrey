"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ClipboardList, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebarContent } from "./sidebar";

const etiquetaRol: Record<string, string> = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
  VENDEDOR: "Vendedor",
  CONSULTA: "Consulta",
};

export function Header() {
  const { data: session } = useSession();
  const usuario = session?.user?.usuario ?? "";
  const rol = session?.user?.rol ?? "";
  const [menuAbierto, setMenuAbierto] = useState(false);
  const nombreRol = etiquetaRol[rol] || rol || "Usuario";
  const iniciales = usuario.trim().slice(0, 2).toUpperCase() || "US";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-2 sm:h-14 sm:px-4">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[82vw] max-w-72 border-r-red-100 p-0"
          >
            <MobileSidebarContent onNavigate={() => setMenuAbierto(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white min-[380px]:flex">
            <ClipboardList className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-sm font-bold text-slate-800">
            Inventario MKT
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-9 max-w-[55vw] items-center gap-2 px-1.5 sm:max-w-none sm:px-2"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 flex-col items-start sm:flex">
              <span className="max-w-36 truncate text-sm font-medium leading-none">
                {usuario || "Usuario"}
              </span>
              <Badge
                variant={rol === "ADMIN" ? "default" : "secondary"}
                className="mt-0.5 h-4 px-1.5 text-[10px] font-medium"
              >
                {nombreRol}
              </Badge>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              <span className="truncate font-medium">
                {usuario || "Usuario"}
              </span>
              <Badge
                variant={rol === "ADMIN" ? "default" : "secondary"}
                className="h-4 w-fit px-1.5 text-[10px] font-medium"
              >
                {nombreRol}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}