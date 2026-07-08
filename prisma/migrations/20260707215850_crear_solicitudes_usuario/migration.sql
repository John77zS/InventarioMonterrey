-- CreateEnum
CREATE TYPE "EstadoSolicitudUsuario" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "solicitudUsuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "correo" TEXT,
    "passwordHash" TEXT NOT NULL,
    "rolAsignado" "Rol",
    "estado" "EstadoSolicitudUsuario" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRevision" TIMESTAMP(3),
    "revisadoPorId" INTEGER,

    CONSTRAINT "solicitudUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitudUsuario_usuario_key" ON "solicitudUsuario"("usuario");

-- AddForeignKey
ALTER TABLE "solicitudUsuario" ADD CONSTRAINT "solicitudUsuario_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
