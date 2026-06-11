import { getPartes } from "@/app/actions/partes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import DateFilter from "@/app/components/DateFilter";

export default async function PartesPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const hoy = format(new Date(), "yyyy-MM-dd");
  const fecha = params.fecha ?? hoy;

  const partes = await getPartes(fecha);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Partes Diarios</h1>
        <div className="flex items-center gap-3">
          <DateFilter fecha={fecha} basePath="/partes" />
          <Link
            href={`/partes/nuevo?fecha=${fecha}`}
            className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600"
          >
            Nuevo Parte
          </Link>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {format(new Date(fecha + "T12:00:00"), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
      </p>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Dependencia</th>
              <th className="text-left px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Personal</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay partes para esta fecha.{" "}
                  <Link href={`/partes/nuevo?fecha=${fecha}`} className="text-slate-700 underline">
                    Crear uno
                  </Link>
                </td>
              </tr>
            )}
            {partes.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                <td className="px-4 py-3 font-medium">{p.dependencia.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{p.responsableCarga ?? "-"}</td>
                <td className="px-4 py-3 text-center">{p._count.detalles}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === "Validado"
                        ? "bg-green-100 text-green-800"
                        : p.estado === "Enviado"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/partes/${p.id}`} className="text-slate-700 hover:underline text-xs">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
