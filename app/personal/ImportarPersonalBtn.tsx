"use client";

import { useState } from "react";
import { importarPersonalDesdeData } from "@/app/actions/personal";

export default function ImportarPersonalBtn() {
  const [estado, setEstado] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [resultado, setResultado] = useState<{ importados: number; errores: number } | null>(null);

  async function handleImportar() {
    if (!confirm("¿Importar los 398 registros del personal desde el archivo de datos? Los registros existentes serán actualizados.")) return;
    setEstado("loading");
    try {
      const res = await importarPersonalDesdeData();
      setResultado(res);
      setEstado("done");
    } catch (e: any) {
      console.error(e);
      setEstado("error");
    }
  }

  if (estado === "done" && resultado) {
    return (
      <span className="text-sm text-green-700 font-medium">
        ✓ Importados: {resultado.importados} · Errores: {resultado.errores}
      </span>
    );
  }

  return (
    <button
      onClick={handleImportar}
      disabled={estado === "loading"}
      className="bg-amber-600 text-white px-4 py-2 rounded text-sm hover:bg-amber-700 disabled:opacity-50"
    >
      {estado === "loading" ? "Importando..." : estado === "error" ? "Error — Reintentar" : "Importar Personal (CSV)"}
    </button>
  );
}
