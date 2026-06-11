"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearParte } from "@/app/actions/partes";

interface Props {
  dependencias: { id: number; nombre: string; responsable?: string | null }[];
  fechaDefault: string;
}

export default function NuevoParteClient({ dependencias, fechaDefault }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [depId, setDepId] = useState("");

  const responsableDefault =
    dependencias.find((d) => d.id === Number(depId))?.responsable ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      const parte = await crearParte({
        dependenciaId: Number(fd.get("dependenciaId")),
        fecha: fd.get("fecha") as string,
        responsableCarga: (fd.get("responsableCarga") as string) || undefined,
      });
      router.push(`/partes/${parte.id}`);
    } catch (err: any) {
      setError(err.message ?? "Error al crear el parte");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            name="fecha"
            type="date"
            defaultValue={fechaDefault}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dependencia *</label>
          <select
            name="dependenciaId"
            required
            value={depId}
            onChange={(e) => setDepId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Seleccionar...</option>
            {dependencias.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de Carga</label>
          <input
            name="responsableCarga"
            defaultValue={responsableDefault}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Al crear el parte se cargará automáticamente todo el personal activo de la dependencia.
      </p>

      <div className="flex gap-3 mt-5">
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white px-5 py-2 rounded text-sm hover:bg-slate-600 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Parte"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
