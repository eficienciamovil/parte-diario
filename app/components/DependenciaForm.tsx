"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearDependencia, actualizarDependencia, toggleDependencia } from "@/app/actions/dependencias";

interface Props {
  dependencia?: {
    id: number;
    codigo: string;
    nombre: string;
    areaSuperior?: string | null;
    responsable?: string | null;
    activa: boolean;
  };
}

export default function DependenciaForm({ dependencia }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      if (dependencia) {
        await actualizarDependencia(dependencia.id, {
          nombre: fd.get("nombre") as string,
          areaSuperior: (fd.get("areaSuperior") as string) || undefined,
          responsable: (fd.get("responsable") as string) || undefined,
          activa: fd.get("activa") === "true",
        });
      } else {
        await crearDependencia({
          codigo: fd.get("codigo") as string,
          nombre: fd.get("nombre") as string,
          areaSuperior: (fd.get("areaSuperior") as string) || undefined,
          responsable: (fd.get("responsable") as string) || undefined,
        });
      }
      router.push("/dependencias");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
          <input
            name="codigo"
            defaultValue={dependencia?.codigo ?? ""}
            required
            disabled={!!dependencia}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50"
            placeholder="DEP-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            name="nombre"
            defaultValue={dependencia?.nombre ?? ""}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Compañía A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área / Unidad Superior</label>
          <input
            name="areaSuperior"
            defaultValue={dependencia?.areaSuperior ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Batallón Logístico"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
          <input
            name="responsable"
            defaultValue={dependencia?.responsable ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Juan Pérez"
          />
        </div>

        {dependencia && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="activa"
              defaultValue={dependencia.activa ? "true" : "false"}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white px-5 py-2 rounded text-sm hover:bg-slate-600 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dependencias")}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
