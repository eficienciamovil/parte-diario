import { getParte } from "@/app/actions/partes";
import { getCausas } from "@/app/actions/causas";
import ParteDetalleClient from "./ParteDetalleClient";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ParteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [parte, causas] = await Promise.all([
    getParte(Number(id)),
    getCausas(true),
  ]);

  if (!parte) notFound();

  const fechaStr = format(new Date(parte.fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parte Diario</h1>
          <p className="text-gray-600 mt-1">
            <span className="font-medium">{parte.dependencia.nombre}</span> &mdash; {fechaStr}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{parte.codigo}</p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              parte.estado === "Validado"
                ? "bg-green-100 text-green-800"
                : parte.estado === "Enviado"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {parte.estado}
          </span>
          {parte.responsableCarga && (
            <p className="text-xs text-gray-500 mt-1">Resp: {parte.responsableCarga}</p>
          )}
        </div>
      </div>

      <ParteDetalleClient
        parte={parte}
        causas={causas}
        readonly={parte.estado === "Validado"}
      />
    </div>
  );
}
