"use client";

import { useState } from "react";
import Link from "next/link";
import { eliminarPersonal, reactivarPersonal } from "@/app/actions/personal";

interface Props {
  id: number;
  estado: string;
}

export default function AccionesPersonalBtn({ id, estado }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleBaja() {
    if (!confirm("¿Dar de baja a este personal?")) return;
    setLoading(true);
    await eliminarPersonal(id);
    setLoading(false);
  }

  async function handleReactivar() {
    if (!confirm("¿Reactivar a este personal?")) return;
    setLoading(true);
    await reactivarPersonal(id);
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link href={`/personal/${id}`} className="text-slate-700 hover:underline text-xs">
        Editar
      </Link>
      {estado === "Activo" ? (
        <button
          onClick={handleBaja}
          disabled={loading}
          className="text-red-600 hover:underline text-xs disabled:opacity-40"
        >
          {loading ? "..." : "Dar de baja"}
        </button>
      ) : (
        <button
          onClick={handleReactivar}
          disabled={loading}
          className="text-green-700 hover:underline text-xs disabled:opacity-40"
        >
          {loading ? "..." : "Reactivar"}
        </button>
      )}
    </div>
  );
}
