/*
  Warnings:

  - The values [JUAN] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrigenMovimiento" ADD VALUE 'ENTREGA_MATERIAL';
ALTER TYPE "OrigenMovimiento" ADD VALUE 'RECEPCION_MATERIAL';

-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'VENDEDOR');
ALTER TABLE "tipoUsuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
COMMIT;

-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "apPaterno" SET DEFAULT 'N/A',
ALTER COLUMN "telefono" SET DEFAULT 'N/A';

-- AlterTable
ALTER TABLE "Compra" ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "fechaVencimiento" TIMESTAMP(3),
ADD COLUMN     "observacion" TEXT,
ADD COLUMN     "ubicacion" TEXT,
ADD COLUMN     "unidadMedida" TEXT NOT NULL DEFAULT 'Unidad',
ALTER COLUMN "precioVenta" SET DEFAULT 0,
ALTER COLUMN "talla" SET DEFAULT 'N/A',
ALTER COLUMN "color" SET DEFAULT 'N/A',
ALTER COLUMN "costo" SET DEFAULT 0,
ALTER COLUMN "margen" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Proveedor" ALTER COLUMN "telefono" SET DEFAULT 'N/A';

-- AlterTable
ALTER TABLE "Venta" ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "detalleCompra" ALTER COLUMN "precioCompra" SET DEFAULT 0,
ALTER COLUMN "subtotal" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "detalleVenta" ALTER COLUMN "precio" SET DEFAULT 0,
ALTER COLUMN "subtotal" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "sesionCaja" ALTER COLUMN "montoInicial" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");
