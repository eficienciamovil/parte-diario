"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarAsistencia, actualizarEstadoParte } from "@/app/actions/partes";

interface Causa {
  id: number;
  causa: string;
  computaComoAusente: boolean;
  requiereObservacion: boolean;
}

interface Detalle {
  id: number;
  situacion: string;
  causaId: number | null;
  observacion: string | null;
  justificado: boolean;
  personal: {
    id: number;
    grado: string;
    apellidoNombre: string;
    cargo: string | null;
  };
  causa: Causa | null;
}

interface Props {
  parte: {
    id: number;
    estado: string;
    detalles: Detalle[];
    observaciones: string | null;
  };
  causas: Causa[];
  readonly: boolean;
}

export default function ParteDetalleClient({ parte, causas, readonly }: Props) {
  const router = useRouter();
  const [detalles, setDetalles] = useState<Detalle[]>(parte.detalles);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const presentes = detalles.filter(
    (d) => d.situacion === "Presente" || (d.causa && !d.causa.computaComoAusente)
  ).length;
  const ausentes = detalles.length - presentes;

  function updateDetalle(id: number, changes: Partial<Detalle>) {
    setDetalles((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d, ...changes };
        // Si cambia a Presente, limpiar causa
        if (changes.situacion === "Presente") {
          updated.causaId = null;
          updated.causa = null;
          updated.justificado = false;
        }
        // Si cambia causa, actualizar referencia
        if (changes.causaId !== undefined) {
          updated.causa = causas.find((c) => c.id === changes.causaId) ?? null;
        }
        return updated;
      })
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await guardarAsistencia(
        parte.id,
        detalles.map((d) => ({
          id: d.id,
          situacion: d.situacion,
          causaId: d.causaId,
          observacion: d.observacion ?? undefined,
          justificado: d.justificado,
        }))
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleEstado(nuevoEstado: string) {
    setCambiandoEstado(true);
    try {
      await actualizarEstadoParte(parte.id, nuevoEstado);
      router.refresh();
    } finally {
      setCambiandoEstado(false);
    }
  }

  return (
    <div>
      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-slate-800">{detalles.length}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500">Presentes</p>
          <p className="text-2xl font-bold text-green-700">{presentes}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500">Ausentes</p>
          <p className="text-2xl font-bold text-red-700">{ausentes}</p>
        </div>
      </div>

      {/* Tabla de asistencia */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-left px-3 py-3 w-8">#</th>
              <th className="text-left px-3 py-3">Grado</th>
              <th className="text-left px-3 py-3">Apellido y Nombre</th>
              <th className="text-left px-3 py-3">Cargo</th>
              <th className="px-3 py-3 w-32">Situacion</th>
              <th className="px-3 py-3">Causa</th>
              <th className="px-3 py-3">Just.</th>
              <th className="px-3 py-3">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {detalles.map((d, idx) => (
              <tr
                key={d.id}
                className={`${
                  d.situacion === "Ausente" && (!d.causa || d.causa.computaComoAusente)
                    ? "bg-red-50"
                    : d.situacion === "Ausente"
                    ? "bg-yellow-50"
                    : ""
                }`}
              >
                <td className="px-3 py-2 text-gray-400 text-xs">{idx + 1}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{d.personal.grado}</td>
                <td className="px-3 py-2 whitespace-nowrap">{d.personal.apellidoNombre}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{d.personal.cargo ?? ""}</td>
                <td className="px-3 py-2">
                  {readonly ? (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        d.situacion === "Presente" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {d.situacion}
                    </span>
                  ) : (
                    <select
                      value={d.situacion}
                      onChange={(e) =>
                        updateDetalle(d.id, { situacion: e.target.value })
                      }
                      className={`border rounded px-2 py-1 text-xs w-full ${
                        d.situacion === "Presente"
                          ? "border-green-300 text-green-800"
                          : "border-red-300 text-red-800"
                      }`}
                    >
                      <option value="Presente">Presente</option>
                      <option value="Ausente">Ausente</option>
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {!readonly && d.situacion === "Ausente" ? (
                    <select
                      value={d.causaId ?? ""}
                      onChange={(e) =>
                        updateDetalle(d.id, {
                          causaId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-xs w-full min-w-32"
                    >
                      <option value="">-- Sin causa --</option>
                      {causas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.causa}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-600">{d.causa?.causa ?? ""}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {!readonly && d.situacion === "Ausente" ? (
                    <input
                      type="checkbox"
                      checked={d.justificado}
                      onChange={(e) => updateDetalle(d.id, { justificado: e.target.checked })}
                    />
                  ) : (
                    <span className="text-xs">{d.justificado ? "Si" : ""}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {!readonly ? (
                    <input
                      type="text"
                      value={d.observacion ?? ""}
                      onChange={(e) => updateDetalle(d.id, { observacion: e.target.value })}
                      className="border border-gray-200 rounded px-2 py-1 text-xs w-full"
                      placeholder="Obs..."
                    />
                  ) : (
                    <span className="text-xs text-gray-600">{d.observacion ?? ""}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Acciones */}
      {!readonly && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-700 text-white px-5 py-2 rounded text-sm hover:bg-slate-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {saved && <span className="text-green-600 text-sm">Guardado.</span>}

          {parte.estado === "Borrador" && (
            <button
              onClick={() => handleEstado("Enviado")}
              disabled={cambiandoEstado}
              className="bg-blue-700 text-white px-5 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {cambiandoEstado ? "..." : "Enviar Parte"}
            </button>
          )}
          {parte.estado === "Enviado" && (
            <button
              onClick={() => handleEstado("Validado")}
              disabled={cambiandoEstado}
              className="bg-green-700 text-white px-5 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {cambiandoEstado ? "..." : "Validar Parte"}
            </button>
          )}
        </div>
      )}

      {readonly && (
        <div className="flex gap-3">
          <button
            onClick={() => handleEstado("Enviado")}
            disabled={cambiandoEstado}
            className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Volver a Enviado
          </button>
        </div>
      )}
    </div>
  );
}
