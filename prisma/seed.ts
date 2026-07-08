import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Iniciando seed de Inventario MKT...")

  await prisma.detalleVenta.deleteMany()
  await prisma.venta.deleteMany()
  await prisma.sesionCaja.deleteMany()
  await prisma.movimientoInventario.deleteMany()
  await prisma.detalleCompra.deleteMany()
  await prisma.compra.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.categoriaProducto.deleteMany()
  await prisma.proveedor.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.tipoPago.deleteMany()

  const tipoAdmin = await prisma.tipoUsuario.upsert({
    where: { rol: "ADMIN" },
    update: {},
    create: { rol: "ADMIN" },
  })

  const tipoOperador = await prisma.tipoUsuario.upsert({
    where: { rol: "VENDEDOR" },
    update: {},
    create: { rol: "VENDEDOR" },
  })

  const admin = await prisma.usuario.upsert({
    where: { usuario: "admin" },
    update: {
      idTipoUsuario: tipoAdmin.id,
      password: await bcrypt.hash("admin123", 10),
      estado: "ACTIVO",
    },
    create: {
      idTipoUsuario: tipoAdmin.id,
      usuario: "admin",
      password: await bcrypt.hash("admin123", 10),
      estado: "ACTIVO",
    },
  })

  await prisma.usuario.upsert({
    where: { usuario: "operador" },
    update: {
      idTipoUsuario: tipoOperador.id,
      password: await bcrypt.hash("operador123", 10),
      estado: "ACTIVO",
    },
    create: {
      idTipoUsuario: tipoOperador.id,
      usuario: "operador",
      password: await bcrypt.hash("operador123", 10),
      estado: "ACTIVO",
    },
  })

  const categorias = await Promise.all([
    prisma.categoriaProducto.create({
      data: {
        nombreCategoria: "Material POP",
        descripcion: "Material publicitario para punto de venta",
      },
    }),
    prisma.categoriaProducto.create({
      data: {
        nombreCategoria: "Impresos",
        descripcion: "Afiches, volantes, flyers y catalogos",
      },
    }),
    prisma.categoriaProducto.create({
      data: {
        nombreCategoria: "Merchandising",
        descripcion: "Articulos promocionales con marca",
      },
    }),
    prisma.categoriaProducto.create({
      data: {
        nombreCategoria: "Eventos y Activaciones",
        descripcion: "Material para ferias, campanas y activaciones",
      },
    }),
    prisma.categoriaProducto.create({
      data: {
        nombreCategoria: "Senaletica",
        descripcion: "Banners, vinilos, letreros y senalizacion",
      },
    }),
  ])

  await Promise.all([
    prisma.proveedor.create({
      data: {
        nombreEmpresa: "Proveedor General MKT",
        representante: "Por definir",
        telefono: "N/A",
        correo: "proveedor@mkt.com",
        ubicacion: "Por definir",
      },
    }),
    prisma.proveedor.create({
      data: {
        nombreEmpresa: "Imprenta Aliada",
        representante: "Por definir",
        telefono: "N/A",
        correo: "imprenta@mkt.com",
        ubicacion: "Por definir",
      },
    }),
    prisma.proveedor.create({
      data: {
        nombreEmpresa: "Proveedor Merchandising",
        representante: "Por definir",
        telefono: "N/A",
        correo: "merchandising@mkt.com",
        ubicacion: "Por definir",
      },
    }),
  ])

  await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: "Marketing",
        apPaterno: "Interno",
        telefono: "N/A",
        correo: "marketing@empresa.com",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Comercial",
        apPaterno: "Interno",
        telefono: "N/A",
        correo: "comercial@empresa.com",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Operaciones",
        apPaterno: "Interno",
        telefono: "N/A",
        correo: "operaciones@empresa.com",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Sucursales",
        apPaterno: "Interno",
        telefono: "N/A",
        correo: "sucursales@empresa.com",
      },
    }),
  ])

  await prisma.tipoPago.createMany({
    data: [
      { tipoMetodo: "EFECTIVO", moneda: "BOB" },
      { tipoMetodo: "TARJETA", moneda: "BOB" },
      { tipoMetodo: "QR", moneda: "BOB" },
    ],
    skipDuplicates: true,
  })

  const [materialPop, impresos, merchandising, eventos, senaletica] = categorias

  const materiales = [
    {
      codigo: "MKT-POP-001",
      nombreProducto: "Display de mostrador",
      idCategoriaProducto: materialPop.id,
      unidadMedida: "Unidad",
      ubicacion: "Almacen Marketing",
      stock: 0,
      stockMinimo: 5,
      costo: 0,
      observacion: "Material para punto de venta",
    },
    {
      codigo: "MKT-IMP-001",
      nombreProducto: "Afiches promocionales",
      idCategoriaProducto: impresos.id,
      unidadMedida: "Unidad",
      ubicacion: "Almacen Marketing",
      stock: 0,
      stockMinimo: 20,
      costo: 0,
      observacion: "Material impreso para campanas",
    },
    {
      codigo: "MKT-MER-001",
      nombreProducto: "Boligrafos corporativos",
      idCategoriaProducto: merchandising.id,
      unidadMedida: "Unidad",
      ubicacion: "Almacen Marketing",
      stock: 0,
      stockMinimo: 50,
      costo: 0,
      observacion: "Merchandising institucional",
    },
    {
      codigo: "MKT-EVE-001",
      nombreProducto: "Roll screen para activaciones",
      idCategoriaProducto: eventos.id,
      unidadMedida: "Unidad",
      ubicacion: "Deposito Eventos",
      stock: 0,
      stockMinimo: 2,
      costo: 0,
      observacion: "Material para eventos",
    },
    {
      codigo: "MKT-SEN-001",
      nombreProducto: "Banner institucional",
      idCategoriaProducto: senaletica.id,
      unidadMedida: "Unidad",
      ubicacion: "Deposito Senaletica",
      stock: 0,
      stockMinimo: 3,
      costo: 0,
      observacion: "Material de comunicacion visual",
    },
  ]

  for (const material of materiales) {
    const producto = await prisma.producto.create({
      data: {
        ...material,
        precioVenta: 0,
        marca: "Inventario MKT",
        talla: "N/A",
        color: "N/A",
        margen: 0,
        estado: "ACTIVO",
      },
    })

    await prisma.movimientoInventario.create({
      data: {
        idProducto: producto.id,
        idUsuario: admin.id,
        tipo: "ENTRADA",
        origen: "STOCK_INICIAL",
        cantidad: producto.stock,
        descripcion: "Registro inicial de material de marketing",
      },
    })
  }

  console.log("Seed completado correctamente")
  console.log("Usuario ADMIN: admin / admin123")
  console.log("Usuario OPERADOR: operador / operador123")
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
