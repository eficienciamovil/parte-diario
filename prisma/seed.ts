import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { personalData } from "./personal-data";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // Causas de ausencia
  const causas = [
    { codigo: "CAU-001", causa: "Franco", computaComoAusente: false, requiereObservacion: false },
    { codigo: "CAU-002", causa: "Licencia Ordinaria", computaComoAusente: true, requiereObservacion: false },
    { codigo: "CAU-003", causa: "Licencia Médica", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-004", causa: "Enfermedad", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-005", causa: "Comisión", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-006", causa: "Servicio Externo", computaComoAusente: false, requiereObservacion: true },
    { codigo: "CAU-007", causa: "Arresto", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-008", causa: "Guardia", computaComoAusente: false, requiereObservacion: false },
    { codigo: "CAU-009", causa: "Inspección", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-010", causa: "Junta de Calificaciones", computaComoAusente: true, requiereObservacion: false },
    { codigo: "CAU-011", causa: "Licencia Extraordinaria", computaComoAusente: true, requiereObservacion: false },
    { codigo: "CAU-012", causa: "Art. 34 CDFFAA", computaComoAusente: true, requiereObservacion: true },
    { codigo: "CAU-013", causa: "Comisión CHIPRE", computaComoAusente: true, requiereObservacion: false },
    { codigo: "CAU-014", causa: "Otro", computaComoAusente: true, requiereObservacion: true },
  ];

  for (const c of causas) {
    await (prisma as any).causaAusencia.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: c,
    });
  }

  // Dependencias
  const dependencias = [
    { codigo: "DIR-INT", nombre: "Dir Int", areaSuperior: "Dirección de Intendencia" },
    { codigo: "SAS-MIL", nombre: "Sas Mil Cen", areaSuperior: "Sastrería Militar Central" },
    { codigo: "B-INT-601", nombre: "B Int 601", areaSuperior: "Batallón de Intendencia 601" },
  ];

  const depMap: Record<string, number> = {};
  for (const d of dependencias) {
    const dep = await (prisma as any).dependencia.upsert({
      where: { codigo: d.codigo },
      update: {},
      create: d,
    });
    depMap[d.codigo] = dep.id;
  }

  // Usuarios
  const usuarios = [
    { nombre: "Administrador", usuario: "admin", password: "admin123", rol: "ADMIN", dependenciaId: null },
    { nombre: "Dirección de Intendencia", usuario: "dirint", password: "dirint123", rol: "UNIDAD", depCodigo: "DIR-INT" },
    { nombre: "Sastrería Militar", usuario: "sastre", password: "sastre123", rol: "UNIDAD", depCodigo: "SAS-MIL" },
    { nombre: "Batallón Int 601", usuario: "bint601", password: "bint601123", rol: "UNIDAD", depCodigo: "B-INT-601" },
  ];

  for (const u of usuarios) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const dependenciaId = u.depCodigo ? depMap[u.depCodigo] : null;
    await (prisma as any).usuario.upsert({
      where: { usuario: u.usuario },
      update: {},
      create: {
        nombre: u.nombre,
        usuario: u.usuario,
        passwordHash,
        rol: u.rol,
        dependenciaId,
      },
    });
  }

  // Personal
  const mapUnidad: Record<string, string> = {
    "dir int": "DIR-INT",
    "sas mil": "SAS-MIL",
    "b int 601": "B-INT-601",
  };

  function depCodigo(unidad: string): string | null {
    const u = unidad.toLowerCase();
    if (u.startsWith("dir int") || u.startsWith("com dir int")) return "DIR-INT";
    if (u.startsWith("sas mil")) return "SAS-MIL";
    if (u.startsWith("b int 601")) return "B-INT-601";
    return null;
  }

  let importados = 0;
  for (const p of personalData) {
    const cod = depCodigo(p.unidad);
    if (!cod || !depMap[cod]) continue;
    await (prisma as any).personal.upsert({
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
  }

  console.log("Seed completado.");
  console.log(`  Personal importado: ${importados}`);
  console.log("Usuarios:");
  console.log("  admin / admin123 (Administrador)");
  console.log("  dirint / dirint123 (Dir Int)");
  console.log("  sastre / sastre123 (Sas Mil Cen)");
  console.log("  bint601 / bint601123 (B Int 601)");
}

main()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
