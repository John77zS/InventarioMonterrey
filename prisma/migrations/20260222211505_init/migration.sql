-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "Temporada" AS ENUM ('PRIMAVERA', 'VERANO', 'OTONO', 'INVIERNO', 'TODO_EL_ANNO');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('COMPLETADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'QR');

-- CreateTable
CREATE TABLE "tipoUsuario" (
    "id" SERIAL NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "tipoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "idTipoUsuario" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoriaProducto" (
    "id" SERIAL NOT NULL,
    "nombreCategoria" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categoriaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "idCategoriaProducto" INTEGER NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "precioVenta" DECIMAL(10,2) NOT NULL,
    "marca" TEXT,
    "talla" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "temporada" "Temporada" NOT NULL DEFAULT 'TODO_EL_ANNO',
    "costo" DECIMAL(10,2) NOT NULL,
    "margen" DECIMAL(5,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "representante" TEXT,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "ubicacion" TEXT,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apPaterno" TEXT NOT NULL,
    "apMaterno" TEXT,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipoPago" (
    "id" SERIAL NOT NULL,
    "tipoMetodo" "MetodoPago" NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'BOB',

    CONSTRAINT "tipoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesionCaja" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "horaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaCierre" TIMESTAMP(3),
    "montoInicial" DECIMAL(10,2) NOT NULL,
    "montoFinal" DECIMAL(10,2),
    "estado" "EstadoSesion" NOT NULL DEFAULT 'ABIERTA',

    CONSTRAINT "sesionCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idSesionCaja" INTEGER NOT NULL,
    "idTipoPago" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'COMPLETADA',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "motivoAnulacion" TEXT,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalleVenta" (
    "id" SERIAL NOT NULL,
    "idVenta" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalleVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idProveedor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroDocumento" TEXT,
    "tipoDocumento" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalleCompra" (
    "id" SERIAL NOT NULL,
    "idCompra" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioCompra" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalleCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientoInventario" (
    "id" SERIAL NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "movimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipoUsuario_rol_key" ON "tipoUsuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "tipoPago_tipoMetodo_key" ON "tipoPago"("tipoMetodo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idTipoUsuario_fkey" FOREIGN KEY ("idTipoUsuario") REFERENCES "tipoUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idCategoriaProducto_fkey" FOREIGN KEY ("idCategoriaProducto") REFERENCES "categoriaProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesionCaja" ADD CONSTRAINT "sesionCaja_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_idSesionCaja_fkey" FOREIGN KEY ("idSesionCaja") REFERENCES "sesionCaja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_idTipoPago_fkey" FOREIGN KEY ("idTipoPago") REFERENCES "tipoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalleVenta" ADD CONSTRAINT "detalleVenta_idVenta_fkey" FOREIGN KEY ("idVenta") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalleVenta" ADD CONSTRAINT "detalleVenta_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_idProveedor_fkey" FOREIGN KEY ("idProveedor") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalleCompra" ADD CONSTRAINT "detalleCompra_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalleCompra" ADD CONSTRAINT "detalleCompra_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientoInventario" ADD CONSTRAINT "movimientoInventario_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientoInventario" ADD CONSTRAINT "movimientoInventario_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
