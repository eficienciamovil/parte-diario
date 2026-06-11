"use client";

import { useCallback } from "react";

interface InfoUnidad {
  nombre: string;
  label: string;
  estado: string;
  firmadoPor?: string | null;
}

interface Props {
  titulo: string;
  subtitulo?: string;
  columnas: string[];
  filas: (string | number)[][];
  estadisticas: { presentes: number; ausentes: number; total: number };
  nombreArchivo: string;
  firmadoPor?: string | null;
  infoUnidades?: InfoUnidad[];
}

export default function BotonDescargaPDF({
  titulo,
  subtitulo,
  columnas,
  filas,
  estadisticas,
  nombreArchivo,
  firmadoPor,
  infoUnidades,
}: Props) {
  const handleDownload = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Título principal
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 14, 18);

    let cursorY = 26;

    if (subtitulo) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(subtitulo, 14, cursorY);
      cursorY += 7;
    }

    // Indicadores de unidades (solo consolidado)
    if (infoUnidades && infoUnidades.length > 0) {
      const colW = (pageW - 28) / infoUnidades.length;
      infoUnidades.forEach((u, idx) => {
        const x = 14 + idx * colW;
        const cerrado = u.estado === "Cerrado";
        doc.setDrawColor(cerrado ? 34 : 220, cerrado ? 197 : 38, cerrado ? 94 : 38);
        doc.setFillColor(cerrado ? 240 : 254, cerrado ? 253 : 242, cerrado ? 244 : 242);
        doc.roundedRect(x, cursorY, colW - 3, 14, 2, 2, "FD");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(cerrado ? 20 : 180, cerrado ? 120 : 40, cerrado ? 60 : 40);
        doc.text(u.nombre, x + 3, cursorY + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(
          cerrado ? `Cerrado · ${u.firmadoPor ?? ""}` : u.estado === "Abierto" ? "En curso..." : "Sin parte",
          x + 3,
          cursorY + 10
        );
      });
      cursorY += 18;
    }

    // Totales
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(14, cursorY, 35, 7, 1, 1, "F");
    doc.text(`Presentes: ${estadisticas.presentes}`, 16, cursorY + 4.5);
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(52, cursorY, 32, 7, 1, 1, "F");
    doc.text(`Ausentes: ${estadisticas.ausentes}`, 54, cursorY + 4.5);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(87, cursorY, 28, 7, 1, 1, "F");
    doc.text(`Total: ${estadisticas.total}`, 89, cursorY + 4.5);
    cursorY += 11;

    // Tabla
    autoTable(doc, {
      startY: cursorY,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { halign: "center", cellWidth: 10 } },
      didParseCell: (data: any) => {
        const raw = data.row.raw as (string | number)[];
        if (data.section === "body" && raw[3] === "Ausente") {
          data.cell.styles.fillColor = [254, 242, 242];
          data.cell.styles.textColor = [185, 28, 28];
        }
      },
    });

    // Firma al pie
    const finalY = (doc as any).lastAutoTable.finalY ?? cursorY + 10;
    if (firmadoPor) {
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`Firmado por: ${firmadoPor}`, 14, finalY + 8);
    }

    // Pie de página con fecha/hora de generación
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const ahora = new Date().toLocaleString("es-AR");
    doc.text(`Generado el ${ahora}`, pageW - 14, finalY + 8, { align: "right" });

    doc.save(nombreArchivo);
  }, [titulo, subtitulo, columnas, filas, estadisticas, nombreArchivo, firmadoPor, infoUnidades]);

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors font-medium"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Descargar PDF
    </button>
  );
}
