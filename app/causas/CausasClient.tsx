"use client";

import { useState } from "react";
import { crearCausa, actualizarCausa } from "@/app/actions/causas";
import { useRouter } from "next/navigation";

interface Causa {
  id: number;
  codigo: string;
  causa: string;
  computaComoAusente: boolean;
  requiereObservacion: boolean;
  activa: boolean;
}

interface Props {
  causas: Causa[];
}

const EMPTY = {
  codigo: "",
  causa: "",
  computaComoAusente: true,
  requiereObservacion: false,
};

export default function CausasClient({ causas }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState<Causa | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  function abrirNuevo() {
    setEditando(null);
    setForm(EMPTY);
    setNuevo(true);
  }

  function abrirEditar(c: Causa) {
    setEditando(c);
    setForm({
      codigo: c.codigo,
      causa: c.causa,
      computaComoAusente: c.computaComoAusente,
      requiereObservacion: c.requiereObservacion,
    });
    setNuevo(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editando) {
        await actualizarCausa(editando.id, {
          causa: form.causa,
          computaComoAusente: form.computaComoAusente,
          requiereObservacion: form.requiereObservacion,
          activa: editando.activa,
        });
      } else {
        await crearCausa({
          codigo: form.codigo,
          causa: form.causa,
          computaComoAusente: form.computaComoAusente,
          requiereObservacion: form.requiereObservacion,
        });
      }
      setNuevo(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={abrirNuevo}
          className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600"
        >
          Nueva Causa
        </button>
      </div>

      {nuevo && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-5 mb-5 max-w-lg"
        >
          <h2 className="font-semibold text-slate-800 mb-4">
            {editando ? "Editar Causa" : "Nueva Causa"}
          </h2>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                disabled={!!editando}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50"
                placeholder="CAU-010"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <input
                value={form.causa}
                onChange={(e) => setForm({ ...form, causa: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.computaComoAusente}
                  onChange={(e) => setForm({ ...form, computaComoAusente: e.target.checked })}
                />
                Computa como ausente
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requiereObservacion}
                  onChange={(e) => setForm({ ...form, requiereObservacion: e.target.checked })}
                />
                Requiere observación
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setNuevo(false)}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Causa</th>
              <th className="px-4 py-3">Ausente</th>
              <th className="px-4 py-3">Req. Obs.</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {causas.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{c.codigo}</td>
                <td className="px-4 py-3">{c.causa}</td>
                <td className="px-4 py-3 text-center">{c.computaComoAusente ? "Si" : "No"}</td>
                <td className="px-4 py-3 text-center">{c.requiereObservacion ? "Si" : "No"}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.activa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="text-slate-700 hover:underline text-xs"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
