import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  await (prisma as any).detalleAsistencia.deleteMany({});
  await (prisma as any).parteDiario.deleteMany({});

  const total = await (prisma as any).personal.count();
  const byDep = await (prisma as any).personal.groupBy({
    by: ["dependenciaId"],
    _count: { id: true },
  });

  const deps = await (prisma as any).dependencia.findMany();
  const depNames: Record<number, string> = {};
  for (const d of deps) depNames[d.id] = d.nombre;

  console.log(`\nPersonal total en BD: ${total}`);
  for (const g of byDep) {
    console.log(`  ${depNames[g.dependenciaId]}: ${g._count.id} personas`);
  }
  console.log("\nPartes eliminados. Recargue la página para crearlos nuevamente.");
}

main()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
