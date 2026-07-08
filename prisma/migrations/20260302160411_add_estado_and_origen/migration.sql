-- CreateEnum
CREATE TYPE "OrigenMovimiento" AS ENUM ('STOCK_INICIAL', 'COMPRA', 'VENTA', 'AJUSTE_MANUAL', 'DEVOLUCION');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "categoriaProducto" ADD COLUMN     "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "movimientoInventario" ADD COLUMN     "idCompra" INTEGER,
ADD COLUMN     "origen" "OrigenMovimiento" NOT NULL DEFAULT 'AJUSTE_MANUAL';

-- AddForeignKey
ALTER TABLE "movimientoInventario" ADD CONSTRAINT "movimientoInventario_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
