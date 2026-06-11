-- AlterTable
ALTER TABLE "Personal" ADD COLUMN "especialidad" TEXT;
ALTER TABLE "Personal" ADD COLUMN "nro" INTEGER;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'UNIDAD',
    "dependenciaId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "Dependencia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParteConsolidado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Generado',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParteDiario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "dependenciaId" INTEGER NOT NULL,
    "responsableCarga" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "observaciones" TEXT,
    "firmadoPor" TEXT,
    "fechaCierre" DATETIME,
    "consolidadoId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ParteDiario_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "Dependencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParteDiario_consolidadoId_fkey" FOREIGN KEY ("consolidadoId") REFERENCES "ParteConsolidado" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ParteDiario" ("codigo", "createdAt", "dependenciaId", "estado", "fecha", "id", "observaciones", "responsableCarga") SELECT "codigo", "createdAt", "dependenciaId", "estado", "fecha", "id", "observaciones", "responsableCarga" FROM "ParteDiario";
DROP TABLE "ParteDiario";
ALTER TABLE "new_ParteDiario" RENAME TO "ParteDiario";
CREATE UNIQUE INDEX "ParteDiario_codigo_key" ON "ParteDiario"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "ParteConsolidado_codigo_key" ON "ParteConsolidado"("codigo");
