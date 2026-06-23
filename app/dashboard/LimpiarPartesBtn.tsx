"use client";

import { useState } from "react";
import { limpiarPartesPorFecha } from "@/app/actions/partes";

export default function LimpiarPartesBtn({ fecha }: { fecha: string }) {
  const [estado, setEstado] = useState<"idle" | "loading" | "done">("idle");
  const [eliminados, setEliminados] = useState(0);

  async function handleLimpiar() {
    if (!confirm(`¿Eliminar TODOS los partes del ${fecha}? Los usuarios de unidad los volverán a crear al ingresar.`)) return;
    setEstado("loading");
    const n = await limpiarPartesPorFecha(fecha);
    setEliminados(n);
    setEstado("done");
  }

  if (estado === "done") {
    return (
      <span className="text-sm text-amber-700 font-medium">
        ✓ {eliminados} parte{eliminados !== 1 ? "s" : ""} eliminado{eliminados !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <button
      onClick={handleLimpiar}
      disabled={estado === "loading"}
      className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-800 disabled:opacity-50"
    >
      {estado === "loading" ? "Eliminando..." : "Limpiar partes"}
    </button>
  );
}
