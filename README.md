# CambaClothes — Point of Sale System

A full-featured POS and inventory management system built for a clothing boutique. Handles sales, purchases, inventory tracking, customer management, cash register sessions, and reporting — all from a single dashboard.

Built with **Next.js 15**, **PostgreSQL**, **Prisma**, and **shadcn/ui**.

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## Features

- **Point of Sale** — Fast product search, cart management, payment type selection, and receipt generation
- **Inventory Management** — Real-time stock tracking with automatic updates on every sale, purchase, and manual adjustment
- **Purchase Orders** — Register supplier purchases with automatic stock replenishment
- **Customer Management** — Full CRUD with purchase history tracking
- **Supplier Management** — Manage suppliers and link them to purchase orders
- **Cash Register Sessions** — Open/close daily sessions, track cash flow per shift
- **Dashboard & Reports** — KPIs, sales charts, and exportable reports
- **Role-Based Access** — Admin and Vendor roles with route-level protection via middleware
- **Soft Delete** — Records are deactivated, never hard-deleted, preserving data integrity

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v4 (JWT) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | react-hook-form + Zod validation |
| Tables | @tanstack/react-table |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL

### Installation

```bash
git clone https://github.com/Hans3010/Camba_Clothes.git
cd camba-clothes
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/camba_clothes"
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
```
Admin:  admin / admin123
Vendor: vendedor / vendedor123
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login pages (no sidebar)
│   ├── (dashboard)/          # Protected pages
│   │   ├── pos/              # Point of sale
│   │   ├── ventas/           # Sales history
│   │   ├── compras/          # Purchase orders
│   │   ├── productos/        # Product CRUD
│   │   ├── inventario/       # Stock movements
│   │   ├── clientes/         # Customer CRUD
│   │   ├── proveedores/      # Supplier CRUD
│   │   ├── caja/             # Cash register sessions
│   │   ├── categoria/        # Category management
│   │   ├── configuracion/    # Settings (roles, users)
│   │   ├── dashboard/        # KPIs & overview
│   │   └── reportes/         # Charts & reports
│   └── api/                  # API Routes
├── components/
│   ├── forms/                # Form components
│   ├── layout/               # Sidebar & Header
│   ├── modules/              # Complex module components
│   ├── pos/                  # POS-specific components
│   ├── tables/               # DataTable columns & config
│   └── ui/                   # shadcn/ui (auto-generated)
├── lib/
│   ├── prisma.ts             # PrismaClient singleton
│   ├── auth.ts               # NextAuth config
│   ├── utils.ts              # Helpers (cn, formatCurrency)
│   └── validations/          # Zod schemas per module
├── hooks/                    # Custom React hooks
└── middleware.ts             # Route protection
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Seed initial data |
| `npm run db:reset` | Reset DB and re-seed |

---

## Design Decisions

- **Soft delete** — Records use `status: "INACTIVE"` instead of hard deletes to preserve relational integrity
- **Atomic stock updates** — All operations affecting multiple tables use `prisma.$transaction()`
- **Zod validation** — Every API route validates the request body before touching the database
- **Server Components by default** — `"use client"` only when hooks or event handlers are needed
- **Cash session enforcement** — Sales cannot be registered without an open cash register session
