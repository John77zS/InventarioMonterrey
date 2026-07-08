# CambaClothes - Sistema POS para Boutique de Ropa

## Proyecto
Sistema de gestión comercial interno para una boutique de ropa en Santa Cruz, Bolivia.
NO es e-commerce. NO tiene facturación fiscal. NO tiene pasarelas de pago externas.
Solo uso interno en mostrador. Dos roles: ADMIN y VENDEDOR.

## Stack Tecnológico
- **Framework**: Next.js 15 (App Router) con TypeScript
- **Base de datos**: Prisma 7 + PostgreSQL (Supabase en producción)
- **Hosting**: Vercel (app) + Supabase (base de datos)
- **Autenticación**: NextAuth.js v4 con CredentialsProvider (JWT)
- **UI**: shadcn/ui 3.x + Tailwind CSS v4
- **Formularios**: react-hook-form + zod
- **Tablas**: @tanstack/react-table con shadcn DataTable
- **Notificaciones**: Sonner (toast)

## Estructura Actual del Proyecto
```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + Header compartido
│   │   ├── caja/page.tsx           ← Apertura/cierre de caja
│   │   ├── categoria/page.tsx      ← Gestión de categorías
│   │   ├── clientes/page.tsx       ← CRUD + segmentación de clientes
│   │   ├── compras/page.tsx        ← Registro + historial de compras
│   │   ├── configuracion/page.tsx  ← Ajustes (roles, usuarios)
│   │   ├── dashboard/page.tsx      ← KPIs principales (placeholder)
│   │   ├── inventario/page.tsx     ← Valoración + movimientos + ajuste manual
│   │   ├── pos/page.tsx            ← Punto de venta
│   │   ├── productos/page.tsx      ← CRUD productos
│   │   ├── proveedores/            ← CRUD proveedores
│   │   │   ├── page.tsx
│   │   │   └── nuevo/page.tsx
│   │   ├── reportes/page.tsx       ← Reportes (placeholder)
│   │   └── ventas/page.tsx         ← Historial de ventas
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── categorias/             (route.ts + [id]/route.ts)
│       ├── clientes/               (route.ts + [id]/route.ts + segmentacion/route.ts)
│       ├── compras/                (route.ts + [id]/route.ts)
│       ├── detalle-compra/         (route.ts + [id]/route.ts)
│       ├── inventario/             (route.ts + ajuste/route.ts)
│       ├── pos/productos/          (route.ts)
│       ├── productos/              (route.ts + [id]/route.ts)
│       ├── proveedores/            (route.ts + [id]/route.ts)
│       ├── sesion-caja/            (route.ts + [id]/route.ts + historial/route.ts)
│       ├── tipos-pago/             (route.ts)
│       ├── tipo-usuarios/          (route.ts)
│       ├── usuarios/               (route.ts + [id]/route.ts)
│       └── ventas/                 (route.ts + [id]/route.ts)
├── components/
│   ├── forms/                      ← abrir-caja, categoria, cliente, compra, producto, proveedor, usuario
│   ├── layout/                     ← header.tsx, sidebar.tsx
│   ├── modules/                    ← categoria-tab.tsx, usuarios-tab.tsx
│   ├── pos/                        ← cart, checkout-dialog, nota-venta, product-search, resumen-caja, ventas-sesion-actual
│   ├── tables/                     ← clientes, compras, detalle-compra, productos, proveedores, sesiones, usuarios, ventas columns
│   └── ui/                         ← 19 componentes shadcn/ui
├── generated/prisma/               ← Tipos auto-generados por Prisma
├── lib/
│   ├── auth.ts                     ← Configuración de NextAuth
│   ├── prisma.ts                   ← Singleton PrismaClient con PrismaPg adapter
│   ├── utils.ts                    ← Utilidades (cn, formatCurrency)
│   └── validations/                ← Schemas Zod (categoria, producto, proveedor, sesion-caja)
└── types/
    └── next-auth.d.ts              ← Tipos de sesión extendidos
```

## Decisiones Arquitectónicas
- **Soft delete siempre**: Campo `estado` (ACTIVO/INACTIVO/ANULADO), nunca eliminar registros con relaciones
- **Stock en Producto**: Se almacena directo en Producto y se actualiza con cada venta/compra/ajuste
- **stockMinimo**: Alertas cuando stock <= stockMinimo
- **Moneda**: BOB (Bolivianos), sin multi-moneda
- **Sesión de caja obligatoria**: No se puede vender sin sesionCaja ABIERTA
- **motivoAnulacion**: Solo se llena al anular una venta
- **Margen de ganancia**: ((precioVenta - costo) / precioVenta) * 100
- **Prisma 7 con adapter**: PrismaPg adapter + Pool de pg, cacheado en globalThis para Vercel
- **Build en Vercel**: `prisma generate && next build`

## Convenciones de Código
- **Server Components** por defecto. `"use client"` solo con hooks/event handlers
- API Routes con `NextRequest` y `NextResponse`
- Formularios: `react-hook-form` + `zod` + `Form` de shadcn
- Tablas: `@tanstack/react-table` + DataTable de shadcn
- Toast: `Sonner`
- `prisma.$transaction()` para operaciones multi-tabla
- Alias `@/` → `./src/*`
- Archivos: kebab-case | Componentes: PascalCase | Variables: camelCase

## Estado Actual de Desarrollo

### Módulos Completados (API + UI funcional)
- **Autenticación**: Login con NextAuth, middleware, protección de rutas, roles ADMIN/VENDEDOR
- **Usuarios**: CRUD completo en `/configuracion`, solo ADMIN
- **Categorías**: CRUD completo con soft delete
- **Proveedores**: CRUD completo con soft delete
- **Productos**: CRUD con stock, stockMinimo, margen, búsqueda/filtrado
- **Clientes**: CRUD completo + segmentación por frecuencia (frecuente/ocasional/nuevo) + métricas
- **Sesión de Caja**: Apertura/cierre funcional, historial de sesiones
- **POS**: Búsqueda con debounce, carrito, checkout con creación rápida de cliente, nota de venta imprimible
- **Ventas (historial)**: DataTable con filtros, detalle de venta, anulación con motivo (solo ADMIN)
- **Compras**: Registro con combobox de productos, edición inline de cantidad/precio, historial con KPIs y detalle
- **Inventario**: Valoración (stock × costo), tabla de movimientos con filtro, ajuste manual (solo ADMIN) con motivo obligatorio

### Módulos Pendientes
- **Dashboard** (RF-33): KPIs — placeholder actual, falta implementar
- **Reportes** (RF-34 a RF-38): Ventas por período, inventario, productos más vendidos, CMI, rentabilidad — placeholder actual

### Notas de arquitectura vigentes
- `movimientoInventario.origen`: usar `"VENTA"`, `"COMPRA"`, `"AJUSTE_MANUAL"`, `"STOCK_INICIAL"` o `"DEVOLUCION"`
- Soft delete en: Producto, categoriaProducto, Proveedor, Cliente, Compra
- `/api/usuarios` requiere rol ADMIN

## Tablas de la Base de Datos (13 tablas)
tipoUsuario, Usuario, categoriaProducto, Producto, Proveedor, Compra, detalleCompra, Cliente, tipoPago, sesionCaja, Venta, detalleVenta, movimientoInventario

## Requisitos Funcionales Pendientes
| ID | Nombre | Prioridad |
|----|--------|-----------|
| RF-33 | Dashboard de KPIs | Alta |
| RF-34 | Reporte de ventas por período | Alta |
| RF-35 | Reporte de inventario | Alta |
| RF-36 | Reporte de productos más vendidos | Media |
| RF-37 | Cuadro de Mando Integral (CMI) | Media |
| RF-38 | Reporte de rentabilidad por producto | Media |

## Usuarios del Sistema
| Rol | Acceso |
|-----|--------|
| ADMIN | Todo el sistema |
| VENDEDOR | POS, Ventas, Clientes, Consulta de inventario |
