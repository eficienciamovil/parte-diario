"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { personalData } from "@/prisma/personal-data";
import { verifyAdmin } from "@/lib/dal";

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

export async function importarPersonalDesdeData(): Promise<{ importados: number; errores: number }> {
  await verifyAdmin();

  const dependencias = await (db as any).dependencia.findMany({
    select: { id: true, codigo: true },
  });
  const depMap: Record<string, number> = {};
  for (const d of dependencias) depMap[d.codigo] = d.id;

  function depCodigo(unidad: string): string | null {
    const u = unidad.toLowerCase();
    if (u.startsWith("dir int") || u.startsWith("com dir int")) return "DIR-INT";
    if (u.startsWith("sas mil")) return "SAS-MIL";
    if (u.startsWith("b int 601")) return "B-INT-601";
    return null;
  }

  let importados = 0;
  let errores = 0;

  for (const p of personalData) {
    const cod = depCodigo(p.unidad);
    if (!cod || !depMap[cod]) { errores++; continue; }
    try {
      await (db as any).personal.upsert({
        where: { id: p.nro },
        update: {
          nro: p.nro,
          grado: p.grado,
          especialidad: p.especialidad,
          apellidoNombre: p.apellidoNombre,
          dependenciaId: depMap[cod],
          cargo: p.cargo,
          estado: "Activo",
        },
        create: {
          id: p.nro,
          nro: p.nro,
          grado: p.grado,
          especialidad: p.especialidad,
          apellidoNombre: p.apellidoNombre,
          dependenciaId: depMap[cod],
          cargo: p.cargo,
          estado: "Activo",
        },
      });
      importados++;
    } catch {
      errores++;
    }
  }

  revalidatePath("/personal");
  return { importados, errores };
}
