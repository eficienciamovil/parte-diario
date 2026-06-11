"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDependencias() {
  return (db as any).dependencia.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getDependencia(id: number) {
  return (db as any).dependencia.findUnique({ where: { id } });
}

export async function crearDependencia(data: {
  codigo: string;
  nombre: string;
  areaSuperior?: string;
  responsable?: string;
}) {
  await (db as any).dependencia.create({ data });
  revalidatePath("/dependencias");
}

export async function actualizarDependencia(
  id: number,
  data: { nombre: string; areaSuperior?: string; responsable?: string; activa: boolean }
) {
  await (db as any).dependencia.update({ where: { id }, data });
  revalidatePath("/dependencias");
}

export async function toggleDependencia(id: number, activa: boolean) {
  await (db as any).dependencia.update({ where: { id }, data: { activa } });
  revalidatePath("/dependencias");
}
