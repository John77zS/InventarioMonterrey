import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log("Creando roles y usuarios...")

  const tipoAdmin = await prisma.tipoUsuario.upsert({
    where: {
      rol: "ADMIN",
    },
    update: {},
    create: {
      rol: "ADMIN",
    },
  })

  const tipoOperador = await prisma.tipoUsuario.upsert({
    where: {
      rol: "OPERADOR",
    },
    update: {},
    create: {
      rol: "OPERADOR",
    },
  })

  const tipoConsulta = await prisma.tipoUsuario.upsert({
    where: {
      rol: "CONSULTA",
    },
    update: {},
    create: {
      rol: "CONSULTA",
    },
  })

  await prisma.usuario.upsert({
    where: {
      usuario: "admin",
    },
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
    where: {
      usuario: "operador",
    },
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

  await prisma.usuario.upsert({
    where: {
      usuario: "consulta",
    },
    update: {
      idTipoUsuario: tipoConsulta.id,
      password: await bcrypt.hash("consulta123", 10),
      estado: "ACTIVO",
    },
    create: {
      idTipoUsuario: tipoConsulta.id,
      usuario: "consulta",
      password: await bcrypt.hash("consulta123", 10),
      estado: "ACTIVO",
    },
  })

  console.log("Usuarios listos:")
  console.log("ADMIN: admin / admin123")
  console.log("OPERADOR: operador / operador123")
  console.log("CONSULTA: consulta / consulta123")
}

main()
  .catch((error) => {
    console.error("Error creando usuarios:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })