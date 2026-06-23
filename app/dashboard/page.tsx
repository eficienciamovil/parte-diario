import { getResumenPorFecha } from "@/app/actions/partes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import DateFilter from "@/app/components/DateFilter";
import LimpiarPartesBtn from "./LimpiarPartesBtn";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const hoy = format(new Date(), "yyyy-MM-dd");
  const fecha = params.fecha ?? hoy;

  const resumen = await getResumenPorFecha(fecha);

  const totalGlobal = resumen.reduce((acc: number, r: any) => acc + r.total, 0);
  const presentesGlobal = resumen.reduce((acc: number, r: any) => acc + r.presentes, 0);
  const ausentesGlobal = resumen.reduce((acc: number, r: any) => acc + r.ausentes, 0);

  const todasLasCausas: string[] = Array.from(
    new Set(resumen.flatMap((r: any) => Object.keys(r.causasConteo) as string[]))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Resumen General</h1>
        <div className="flex items-center gap-3">
          <DateFilter fecha={fecha} basePath="/dashboard" />
          <LimpiarPartesBtn fecha={fecha} />
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

      {resumen.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No hay partes cargados para esta fecha.{" "}
          <Link href={`/partes/nuevo?fecha=${fecha}`} className="text-slate-700 underline">
            Crear parte
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Personal</p>
              <p className="text-3xl font-bold text-slate-800">{totalGlobal}</p>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Presentes</p>
              <p className="text-3xl font-bold text-green-700">{presentesGlobal}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Ausentes</p>
              <p className="text-3xl font-bold text-red-700">{ausentesGlobal}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Dependencia</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-green-700">Presentes</th>
                  <th className="px-4 py-3 text-red-700">Ausentes</th>
                  {todasLasCausas.map((c) => (
                    <th key={c} className="px-4 py-3 text-gray-600">
                      {c}
                    </th>
                  ))}
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumen.map((r: any) => (
                  <tr key={r.parte.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.dependencia.nombre}</td>
                    <td className="px-4 py-3 text-center">{r.total}</td>
                    <td className="px-4 py-3 text-center text-green-700 font-semibold">{r.presentes}</td>
                    <td className="px-4 py-3 text-center text-red-700 font-semibold">{r.ausentes}</td>
                    {todasLasCausas.map((c) => (
                      <td key={c} className="px-4 py-3 text-center text-gray-600">
                        {r.causasConteo[c] ?? 0}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.parte.estado === "Validado"
                            ? "bg-green-100 text-green-800"
                            : r.parte.estado === "Enviado"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {r.parte.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/partes/${r.parte.id}`}
                        className="text-slate-700 hover:underline text-xs"
                      >
                        Ver parte
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
