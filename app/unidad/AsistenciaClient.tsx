"use client";

import { useState, useTransition } from "react";
import { guardarAsistencia, cerrarParte } from "@/app/actions/partes";
import BotonDescargaPDF from "@/app/components/BotonDescargaPDF";

type Causa = { id: number; causa: string };
type Detalle = {
  id: number;
  situacion: string;
  causaId: number | null;
  observacion: string | null;
  personal: { id: number; apellidoNombre: string; grado: string; especialidad: string | null };
  causa: Causa | null;
};

type Parte = {
  id: number;
  estado: string;
  firmadoPor: string | null;
  fechaCierre: Date | null;
  dependencia: { nombre: string };
  detalles: Detalle[];
};

export default function AsistenciaClient({
  parte,
  causas,
}: {
  parte: Parte;
  causas: Causa[];
}) {
  const cerrado = parte.estado === "Cerrado";

  const [detalles, setDetalles] = useState<
    Record<number, { situacion: string; causaId: number | null; observacion: string }>
  >(
    Object.fromEntries(
      parte.detalles.map((d) => [
        d.id,
        {
          situacion: d.situacion,
          causaId: d.causaId,
          observacion: d.observacion ?? "",
        },
      ])
    )
  );

  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);
  const [cerrandoParte, setCerrandoParte] = useState(false);

  function setSituacion(detalleId: number, situacion: string) {
    setDetalles((prev) => ({
      ...prev,
      [detalleId]: {
        ...prev[detalleId],
        situacion,
        causaId: situacion === "Presente" ? null : prev[detalleId].causaId,
      },
    }));
    setGuardado(false);
  }

  function setCausa(detalleId: number, causaId: number | null) {
    setDetalles((prev) => ({
      ...prev,
      [detalleId]: { ...prev[detalleId], causaId },
    }));
    setGuardado(false);
  }

  function setObservacion(detalleId: number, observacion: string) {
    setDetalles((prev) => ({
      ...prev,
      [detalleId]: { ...prev[detalleId], observacion },
    }));
    setGuardado(false);
  }

  function handleGuardar() {
    startTransition(async () => {
      const data = Object.entries(detalles).map(([id, v]) => ({
        id: Number(id),
        situacion: v.situacion,
        causaId: v.causaId ?? null,
        observacion: v.observacion || undefined,
      }));
      await guardarAsistencia(parte.id, data);
      setGuardado(true);
    });
  }

  function handleCerrar() {
    if (!confirm("¿Confirma que desea firmar y cerrar el parte? Esta acción no se puede deshacer.")) return;
    setCerrandoParte(true);
    startTransition(async () => {
      // Primero guardar los cambios pendientes
      const data = Object.entries(detalles).map(([id, v]) => ({
        id: Number(id),
        situacion: v.situacion,
        causaId: v.causaId ?? null,
        observacion: v.observacion || undefined,
      }));
      await guardarAsistencia(parte.id, data);
      await cerrarParte(parte.id);
    });
  }

  const presentes = Object.values(detalles).filter((d) => d.situacion === "Presente").length;
  const ausentes = Object.values(detalles).filter((d) => d.situacion !== "Presente").length;

  function buildFilasPDF() {
    return parte.detalles.map((d, i) => {
      const val = detalles[d.id];
      const causaNombre = causas.find((c) => c.id === val.causaId)?.causa ?? "";
      const obs = val.observacion ? ` · ${val.observacion}` : "";
      return [
        i + 1,
        d.personal.grado,
        d.personal.apellidoNombre,
        val.situacion,
        val.situacion !== "Presente" ? (causaNombre || "Sin causa") + obs : "—",
      ] as (string | number)[];
    });
  }

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-green-700">{presentes} presentes</span>
          {" · "}
          <span className="font-semibold text-red-700">{ausentes} ausentes</span>
          {" · "}
          <span>{parte.detalles.length} total</span>
        </div>

        <div className="flex gap-2 items-center">
          <BotonDescargaPDF
            titulo={`Parte Diario — ${parte.dependencia.nombre}`}
            subtitulo={hoy}
            columnas={["#", "Grado", "Apellido y Nombre", "Estado", "Causa / Observación"]}
            filas={buildFilasPDF()}
            estadisticas={{ presentes, ausentes, total: parte.detalles.length }}
            nombreArchivo={`parte-${parte.dependencia.nombre.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`}
            firmadoPor={parte.firmadoPor}
          />

          {!cerrado && (
            <>
              <button
                onClick={handleGuardar}
                disabled={isPending}
                className="px-4 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {isPending && !cerrandoParte ? "Guardando..." : guardado ? "Guardado ✓" : "Guardar"}
              </button>
              <button
                onClick={handleCerrar}
                disabled={isPending}
                className="px-4 py-2 bg-green-700 text-white rounded text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {cerrandoParte && isPending ? "Cerrando..." : "Firmar y cerrar parte"}
              </button>
            </>
          )}

          {cerrado && (
            <div className="text-sm text-green-700 font-medium">
              Parte cerrado — firmado por {parte.firmadoPor}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Grado</th>
              <th className="px-4 py-3 text-left">Apellido y Nombre</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-left">Causa / Observación</th>
            </tr>
          </thead>
          <tbody>
            {parte.detalles.map((detalle, i) => {
              const val = detalles[detalle.id];
              const esAusente = val.situacion !== "Presente";

              return (
                <tr
                  key={detalle.id}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} ${
                    esAusente ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {detalle.personal.grado}
                  </td>
                  <td className="px-4 py-3 font-medium">{detalle.personal.apellidoNombre}</td>
                  <td className="px-4 py-3 text-center">
                    {cerrado ? (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          esAusente
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {val.situacion}
                      </span>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSituacion(detalle.id, "Presente")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            !esAusente
                              ? "bg-green-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-green-100"
                          }`}
                        >
                          Presente
                        </button>
                        <button
                          onClick={() => setSituacion(detalle.id, "Ausente")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            esAusente
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-red-100"
                          }`}
                        >
                          Ausente
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {esAusente && !cerrado && (
                      <div className="flex flex-col gap-1">
                        <select
                          value={val.causaId ?? ""}
                          onChange={(e) =>
                            setCausa(detalle.id, e.target.value ? Number(e.target.value) : null)
                          }
                          className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                        >
                          <option value="">-- Seleccionar causa --</option>
                          {causas.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.causa}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Observación (opcional)"
                          value={val.observacion}
                          onChange={(e) => setObservacion(detalle.id, e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                        />
                      </div>
                    )}
                    {esAusente && cerrado && (
                      <span className="text-xs text-slate-600">
                        {detalle.causa?.causa ?? "—"}
                        {detalle.observacion && ` · ${detalle.observacion}`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
