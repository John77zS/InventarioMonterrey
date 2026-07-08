import { ProveedorForm } from "@/components/forms/proveedor-form";

export default function NuevoProveedorPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Proveedor</h2>
        <div className="max-w-2xl">
          <ProveedorForm />
        </div>
      </div>
    </div>
  );
}