"use client";

import { ColumnDef } from "@tanstack/react-table";

export type DetalleCompraRow = {
  idCompra: number;
  idProducto: number;
  producto: { nombre: string };
  cantidad: number;
  precioCompra: number;
  subtotal: number;
};

export const detalleCompraColumns: ColumnDef<DetalleCompraRow>[] = [
  {
    accessorKey: "idCompra",
    header: "ID Compra",
  },
  {
    accessorKey: "producto.nombre",
    header: "Producto",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },
  {
    accessorKey: "precioCompra",
    header: "Precio Unitario",
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
  },
];