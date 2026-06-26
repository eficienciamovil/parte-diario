"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearPersonal, actualizarPersonal } from "@/app/actions/personal";

interface Dependencia {
  id: number;
  nombre: string;
}

interface Props {
  dependencias: Dependencia[];
  persona?: {
    id: number;
    apellidoNombre: string;
    dni?: string | null;
    grado: string;
    cargo?: string | null;
    estado: string;
    dependenciaId: number;
  };
}

const GRADOS = [
  "Tte Cnel", "Mayor", "Capitán", "Tte 1ro", "Teniente", "Subteniente",
  "Suboficial Mayor", "Suboficial Principal", "Sargento Ayudante",
  "Sargento 1ro", "Sargento", "Cabo 1ro", "Cabo",
  "SV 1ra", "SV 2da", "SV 2da EC",
  "Civil",
];

const ESTADOS = ["Activo", "Baja", "Pase"];

export default function PersonalForm({ dependencias, persona }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      if (persona) {
        await actualizarPersonal(persona.id, {
          apellidoNombre: fd.get("apellidoNombre") as string,
          dni: (fd.get("dni") as string) || undefined,
          grado: fd.get("grado") as string,
          cargo: (fd.get("cargo") as string) || undefined,
          dependenciaId: Number(fd.get("dependenciaId")),
          estado: fd.get("estado") as string,
        });
      } else {
        await crearPersonal({
          apellidoNombre: fd.get("apellidoNombre") as string,
          dni: (fd.get("dni") as string) || undefined,
          grado: fd.get("grado") as string,
          cargo: (fd.get("cargo") as string) || undefined,
          dependenciaId: Number(fd.get("dependenciaId")),
        });
      }
      router.push("/personal");
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Dependencia *</label>
          <select
            name="dependenciaId"
            defaultValue={persona?.dependenciaId ?? ""}
            required
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
          <select
            name="grado"
            defaultValue={persona?.grado ?? ""}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Seleccionar...</option>
            {GRADOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido y Nombre *</label>
          <input
            name="apellidoNombre"
            defaultValue={persona?.apellidoNombre ?? ""}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="GARCIA, Juan Carlos"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DNI / Legajo</label>
          <input
            name="dni"
            defaultValue={persona?.dni ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Función</label>
          <input
            name="cargo"
            defaultValue={persona?.cargo ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Jefe de Sección"
          />
        </div>
        {persona && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              defaultValue={persona.estado}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
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
          onClick={() => router.push("/personal")}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
