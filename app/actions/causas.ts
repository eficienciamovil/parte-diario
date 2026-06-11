"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCausas(soloActivas = false) {
  return (db as any).causaAusencia.findMany({
    where: soloActivas ? { activa: true } : undefined,
    orderBy: { causa: "asc" },
  });
}

export async function crearCausa(data: {
  codigo: string;
  causa: string;
  computaComoAusente: boolean;
  requiereObservacion: boolean;
}) {
  await (db as any).causaAusencia.create({ data });
  revalidatePath("/causas");
}

export async function actualizarCausa(
  id: number,
  data: {
    causa: string;
    computaComoAusente: boolean;
    requiereObservacion: boolean;
    activa: boolean;
  }
) {
  await (db as any).causaAusencia.update({ where: { id }, data });
  revalidatePath("/causas");
}
