"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPersonal(dependenciaId?: number) {
  return (db as any).personal.findMany({
    where: dependenciaId ? { dependenciaId } : undefined,
    include: { dependencia: true },
    orderBy: [{ dependenciaId: "asc" }, { apellidoNombre: "asc" }],
  });
}

export async function getPersonaById(id: number) {
  return (db as any).personal.findUnique({
    where: { id },
    include: { dependencia: true },
  });
}

export async function crearPersonal(data: {
  apellidoNombre: string;
  dni?: string;
  grado: string;
  cargo?: string;
  dependenciaId: number;
}) {
  await (db as any).personal.create({ data });
  revalidatePath("/personal");
}

export async function actualizarPersonal(
  id: number,
  data: {
    apellidoNombre: string;
    dni?: string;
    grado: string;
    cargo?: string;
    dependenciaId: number;
    estado: string;
  }
) {
  await (db as any).personal.update({ where: { id }, data });
  revalidatePath("/personal");
}

export async function eliminarPersonal(id: number) {
  await (db as any).personal.update({
    where: { id },
    data: { estado: "Baja" },
  });
  revalidatePath("/personal");
}
