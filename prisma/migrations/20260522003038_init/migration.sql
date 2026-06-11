-- CreateTable
CREATE TABLE "Dependencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "areaSuperior" TEXT,
    "responsable" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apellidoNombre" TEXT NOT NULL,
    "dni" TEXT,
    "grado" TEXT NOT NULL,
    "cargo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "dependenciaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Personal_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "Dependencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParteDiario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "dependenciaId" INTEGER NOT NULL,
    "responsableCarga" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ParteDiario_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "Dependencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetalleAsistencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parteId" INTEGER NOT NULL,
    "personalId" INTEGER NOT NULL,
    "situacion" TEXT NOT NULL DEFAULT 'Presente',
    "causaId" INTEGER,
    "observacion" TEXT,
    "justificado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DetalleAsistencia_parteId_fkey" FOREIGN KEY ("parteId") REFERENCES "ParteDiario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetalleAsistencia_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleAsistencia_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "CausaAusencia" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CausaAusencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "causa" TEXT NOT NULL,
    "computaComoAusente" BOOLEAN NOT NULL DEFAULT true,
    "requiereObservacion" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "Dependencia_codigo_key" ON "Dependencia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ParteDiario_codigo_key" ON "ParteDiario"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "DetalleAsistencia_parteId_personalId_key" ON "DetalleAsistencia"("parteId", "personalId");

-- CreateIndex
CREATE UNIQUE INDEX "CausaAusencia_codigo_key" ON "CausaAusencia"("codigo");
