"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { verifySession } from "@/lib/dal";

function inicioDia(fecha: Date | string): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finDia(fecha: Date | string): Date {
  const d = new Date(fecha);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getPartes(fecha?: string) {
  return (db as any).parteDiario.findMany({
    where: fecha ? { fecha: new Date(fecha) } : undefined,
    include: {
      dependencia: true,
      _count: { select: { detalles: true } },
    },
    orderBy: [{ fecha: "desc" }, { dependencia: { nombre: "asc" } }],
  });
}

export async function getParte(id: number) {
  return (db as any).parteDiario.findUnique({
    where: { id },
    include: {
      dependencia: true,
      detalles: {
        include: {
          personal: true,
          causa: true,
        },
        orderBy: { personal: { apellidoNombre: "asc" } },
      },
    },
  });
}

export async function crearParte(data: {
  dependenciaId: number;
  fecha: string;
  responsableCarga?: string;
}) {
  const fecha = new Date(data.fecha);
  const dep = await (db as any).dependencia.findUnique({
    where: { id: data.dependenciaId },
  });
  const codigo = `PAR-${format(fecha, "yyyyMMdd")}-DEP${String(data.dependenciaId).padStart(3, "0")}`;

  const parte = await (db as any).parteDiario.create({
    data: {
      codigo,
      fecha,
      dependenciaId: data.dependenciaId,
      responsableCarga: data.responsableCarga ?? dep?.responsable ?? "",
      estado: "Borrador",
    },
  });

  // Pre-cargar todo el personal activo de la dependencia
  const personal = await (db as any).personal.findMany({
    where: { dependenciaId: data.dependenciaId, estado: "Activo" },
  });

  if (personal.length > 0) {
    await (db as any).detalleAsistencia.createMany({
      data: personal.map((p: any) => ({
        parteId: parte.id,
        personalId: p.id,
        situacion: "Presente",
      })),
    });
  }

  revalidatePath("/partes");
  return parte;
}

export async function actualizarEstadoParte(id: number, estado: string) {
  await (db as any).parteDiario.update({
    where: { id },
    data: { estado },
  });
  revalidatePath(`/partes/${id}`);
  revalidatePath("/partes");
}

export async function guardarAsistencia(
  parteId: number,
  detalles: Array<{
    id: number;
    situacion: string;
    causaId?: number | null;
    observacion?: string;
    justificado?: boolean;
  }>
) {
  for (const d of detalles) {
    await (db as any).detalleAsistencia.update({
      where: { id: d.id },
      data: {
        situacion: d.situacion,
        causaId: d.situacion === "Presente" ? null : (d.causaId ?? null),
        observacion: d.observacion ?? null,
        justificado: d.justificado ?? false,
      },
    });
  }
  revalidatePath(`/partes/${parteId}`);
}

export async function cerrarParte(parteId: number) {
  const session = await verifySession();

  const parte = await (db as any).parteDiario.findUnique({
    where: { id: parteId },
    include: { dependencia: true },
  });

  if (!parte) throw new Error("Parte no encontrado");

  // Solo el usuario de la unidad correspondiente (o admin) puede cerrar
  if (session.rol !== "ADMIN" && session.dependenciaId !== parte.dependenciaId) {
    throw new Error("Sin permiso para cerrar este parte");
  }

  await (db as any).parteDiario.update({
    where: { id: parteId },
    data: {
      estado: "Cerrado",
      firmadoPor: session.nombre,
      fechaCierre: new Date(),
    },
  });

  // Verificar si todos los partes del día están cerrados para generar consolidado
  const fecha = parte.fecha;
  const todosPartes = await (db as any).parteDiario.findMany({
    where: { fecha: { gte: inicioDia(fecha), lte: finDia(fecha) } },
  });

  const todosCerrados =
    todosPartes.length >= 3 &&
    todosPartes.every((p: any) => p.estado === "Cerrado" || p.id === parteId);

  if (todosCerrados) {
    await generarConsolidado(fecha);
  }

  revalidatePath(`/partes/${parteId}`);
  revalidatePath("/partes");
  revalidatePath("/unidad");
  revalidatePath("/consolidado");
}

export async function generarConsolidado(fecha: Date) {
  const partes = await (db as any).parteDiario.findMany({
    where: {
      fecha: { gte: inicioDia(fecha), lte: finDia(fecha) },
      estado: "Cerrado",
    },
  });

  if (partes.length === 0) return;

  const codigo = `CONS-${format(fecha, "yyyyMMdd")}`;

  // Si ya existe, actualizar; si no, crear
  const existente = await (db as any).parteConsolidado.findUnique({
    where: { codigo },
  });

  if (existente) {
    await (db as any).parteConsolidado.update({
      where: { codigo },
      data: { estado: "Generado" },
    });
    await (db as any).parteDiario.updateMany({
      where: { id: { in: partes.map((p: any) => p.id) } },
      data: { consolidadoId: existente.id },
    });
  } else {
    const consolidado = await (db as any).parteConsolidado.create({
      data: { codigo, fecha, estado: "Generado" },
    });
    await (db as any).parteDiario.updateMany({
      where: { id: { in: partes.map((p: any) => p.id) } },
      data: { consolidadoId: consolidado.id },
    });
  }

  revalidatePath("/consolidado");
  revalidatePath("/dashboard");
}

export async function getPartePorDependenciaYFecha(dependenciaId: number, fecha: Date) {
  return (db as any).parteDiario.findFirst({
    where: {
      dependenciaId,
      fecha: { gte: inicioDia(fecha), lte: finDia(fecha) },
    },
    include: {
      dependencia: true,
      detalles: {
        include: { personal: true, causa: true },
        orderBy: { personal: { apellidoNombre: "asc" } },
      },
    },
  });
}

export async function getConsolidadoPorFecha(fecha: string) {
  const base = new Date(fecha + "T00:00:00");
  const partes = await (db as any).parteDiario.findMany({
    where: { fecha: { gte: inicioDia(base), lte: finDia(base) } },
    include: {
      dependencia: true,
      detalles: {
        include: { personal: true, causa: true },
        orderBy: [
          { personal: { dependencia: { nombre: "asc" } } },
          { personal: { apellidoNombre: "asc" } },
        ],
      },
    },
    orderBy: { dependencia: { nombre: "asc" } },
  });

  return partes;
}

export async function getResumenPorFecha(fecha: string) {
  const partes = await (db as any).parteDiario.findMany({
    where: { fecha: new Date(fecha) },
    include: {
      dependencia: true,
      detalles: {
        include: { causa: true },
      },
    },
    orderBy: { dependencia: { nombre: "asc" } },
  });

  return partes.map((parte: any) => {
    const total = parte.detalles.length;
    const presentes = parte.detalles.filter(
      (d: any) => d.situacion === "Presente" || (d.causa && !d.causa.computaComoAusente)
    ).length;
    const ausentes = total - presentes;

    const causasConteo: Record<string, number> = {};
    for (const d of parte.detalles) {
      if (d.situacion === "Ausente" && d.causa) {
        causasConteo[d.causa.causa] = (causasConteo[d.causa.causa] ?? 0) + 1;
      }
    }

    return {
      parte,
      dependencia: parte.dependencia,
      total,
      presentes,
      ausentes,
      causasConteo,
    };
  });
}
