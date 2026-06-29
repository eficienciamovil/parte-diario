"use client";

import { useState } from "react";
import AccionesPersonalBtn from "./AccionesPersonalBtn";

interface Personal {
  id: number;
  grado: string;
  apellidoNombre: string;
  dni: string | null;
  cargo: string | null;
  estado: string;
  dependencia: { nombre: string };
}

export default function PersonalTable({ personal }: { personal: Personal[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = busqueda.trim()
    ? personal.filter((p) =>
        p.apellidoNombre.toLowerCase().includes(busqueda.toLowerCase().trim())
      )
    : personal;

  return (
    <>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-center px-3 py-3 w-10">#</th>
              <th className="text-left px-4 py-3">Grado</th>
              <th className="text-left px-4 py-3">Apellido y Nombre</th>
              <th className="text-left px-4 py-3">DNI / Legajo</th>
              <th className="text-left px-4 py-3">Cargo</th>
              <th className="text-left px-4 py-3">Dependencia</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {busqueda.trim() ? "Sin resultados." : "No hay personal cargado."}
                </td>
              </tr>
            )}
            {filtrados.map((p) => {
              const nroOriginal = personal.indexOf(p) + 1;
              return (
                <tr key={p.id} className={`hover:bg-gray-50 ${p.estado !== "Activo" ? "opacity-60" : ""}`}>
                  <td className="px-3 py-3 text-center text-slate-400 text-xs font-mono">{nroOriginal}</td>
                  <td className="px-4 py-3 font-medium">{p.grado}</td>
                  <td className="px-4 py-3">{p.apellidoNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{p.dni ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.cargo ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.dependencia.nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.estado === "Activo"
                          ? "bg-green-100 text-green-800"
                          : p.estado === "Pase"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AccionesPersonalBtn id={p.id} estado={p.estado} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
