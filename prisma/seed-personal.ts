import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as never);

function mapearUnidad(unidad: string): string | null {
  const u = unidad.toLowerCase();
  if (u.startsWith("dir int") || u.startsWith("com dir int")) return "DIR-INT";
  if (u.startsWith("sas mil")) return "SAS-MIL";
  if (u.startsWith("b int 601")) return "B-INT-601";
  return null;
}

async function main() {
  // Obtener IDs de dependencias
  const dependencias = await (prisma as any).dependencia.findMany();
  const depMap: Record<string, number> = {};
  for (const d of dependencias) {
    depMap[d.codigo] = d.id;
  }

  const csvPath = path.join(
    "C:\\Users\\user\\Downloads\\PARTE DIARIO TURNO MAÑANA 08 JUNIO DE 2026.csv"
  );
  const lines = fs.readFileSync(csvPath, "utf-8").split("\n");

  let importados = 0;
  let omitidos = 0;

  for (const line of lines) {
    const cols = line.split(";");
    const nroStr = cols[0]?.trim();
    if (!nroStr || !/^\d+$/.test(nroStr)) continue;

    const nro = parseInt(nroStr);
    const grado = cols[1]?.trim() ?? "";
    const especialidad = cols[2]?.trim() ?? "";
    const apellidoNombre = cols[3]?.trim() ?? "";
    const unidadRaw = cols[7]?.trim() ?? "";
    const dependenciaRaw = cols[8]?.trim() ?? "";

    if (!apellidoNombre) continue;

    // Limpiar comillas de los campos con quotes en CSV
    const unidad = unidadRaw.replace(/"/g, "").split(" ")[0] === "Sas"
      ? unidadRaw.replace(/"/g, "").substring(0, 11)
      : unidadRaw.replace(/"/g, "");

    const depCodigo = mapearUnidad(unidadRaw.replace(/"/g, ""));

    if (!depCodigo || !depMap[depCodigo]) {
      omitidos++;
      continue;
    }

    // Limpiar nombre de comillas y caracteres extra
    const nombreLimpio = apellidoNombre.replace(/"/g, "").trim();
    if (!nombreLimpio) continue;

    await (prisma as any).personal.upsert({
      where: {
        // No tenemos un campo único, usamos nro+dependencia como criterio
        id: nro, // temporal: usar nro como id
      },
      update: {
        nro,
        grado,
        especialidad,
        apellidoNombre: nombreLimpio,
        dependenciaId: depMap[depCodigo],
        cargo: dependenciaRaw.replace(/"/g, "").trim(),
        estado: "Activo",
      },
      create: {
        nro,
        grado,
        especialidad,
        apellidoNombre: nombreLimpio,
        dependenciaId: depMap[depCodigo],
        cargo: dependenciaRaw.replace(/"/g, "").trim(),
        estado: "Activo",
      },
    });

    importados++;
  }

  console.log(`\nImportación completada:`);
  console.log(`  Importados: ${importados}`);
  console.log(`  Omitidos (sin unidad mapeada): ${omitidos}`);
}

main()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
