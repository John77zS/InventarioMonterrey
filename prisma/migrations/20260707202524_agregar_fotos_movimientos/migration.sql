-- AlterEnum
ALTER TYPE "OrigenMovimiento" ADD VALUE 'DEVOLUCION_MATERIAL';

-- AlterTable
ALTER TABLE "movimientoInventario" ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "observacionFoto" TEXT;
