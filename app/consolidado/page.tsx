import { verifyAdmin } from "@/lib/dal";
import { getConsolidadoPorFecha } from "@/app/actions/partes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RefreshAuto from "./RefreshAuto";
import BotonDescargaPDF from "@/app/components/BotonDescargaPDF";

const UNIDADES = [
  { nombre: "Dir Int", label: "Dirección de Intendencia" },
  { nombre: "Sas Mil Cen", label: "Sastrería Militar" },
  { nombre: "B Int 601", label: "Batallón Int 601" },
];

export default async function ConsolidadoPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  await verifyAdmin();

  const params = await searchParams;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaStr = params.fecha ?? hoy.toISOString().split("T")[0];

  const partes = await getConsolidadoPorFecha(fechaStr);

  // Mapa unidad → parte
  const partesPorUnidad: Record<string, any> = {};
  for (const p of partes) {
    partesPorUnidad[p.dependencia.nombre] = p;
  }

  // Todos los detalles juntos, numerados
  const todosLosDet = partes.flatMap((p: any) =>
    p.detalles.map((d: any) => ({ ...d, _unidad: p.dependencia.nombre }))
  );

  const presentes = todosLosDet.filter((d: any) => d.situacion === "Presente").length;
  const ausentes = todosLosDet.filter((d: any) => d.situacion !== "Presente").length;
  const total = todosLosDet.length;

  const fecha = new Date(fechaStr + "T00:00:00");
  const fechaDisplay = format(fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  // Datos serializables para el PDF
  const filasConsolidado = todosLosDet.map((d: any, i: number) => [
    i + 1,
    d.personal.grado,
    d.personal.apellidoNombre,
    d.situacion,
    d.causa?.causa ?? (d.situacion !== "Presente" ? "Sin causa" : "—"),
    d._unidad,
  ] as (string | number)[]);

  const infoUnidades = UNIDADES.map(({ nombre, label }) => {
    const p = partesPorUnidad[nombre];
    return {
      nombre,
      label,
      estado: p?.estado ?? "Sin parte",
      firmadoPor: p?.firmadoPor ?? null,
    };
  });

  return (
    <div>
      <RefreshAuto intervaloSeg={30} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parte Consolidado</h1>
          <p className="text-slate-500 text-sm capitalize mt-1">{fechaDisplay}</p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          {total > 0 && (
            <BotonDescargaPDF
              titulo="Parte Diario Consolidado"
              subtitulo={fechaDisplay}
              columnas={["#", "Grado", "Apellido y Nombre", "Estado", "Causa / Observación", "Unidad"]}
              filas={filasConsolidado}
              estadisticas={{ presentes, ausentes, total }}
              nombreArchivo={`consolidado-${fechaStr}.pdf`}
              infoUnidades={infoUnidades}
            />
          )}
          <form className="flex gap-2 items-center">
            <input
              type="date"
              name="fecha"
              defaultValue={fechaStr}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600"
            >
              Ver
            </button>
          </form>
        </div>
      </div>

      {/* Indicador de estado de las tres unidades */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {UNIDADES.map(({ nombre, label }) => {
          const p = partesPorUnidad[nombre];
          const cerrado = p?.estado === "Cerrado";
          const enCurso = p && !cerrado;

          return (
            <div
              key={nombre}
              className={`rounded-xl p-5 border-2 flex flex-col gap-2 ${
                cerrado
                  ? "border-green-500 bg-green-50"
                  : "border-red-400 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    cerrado ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-semibold text-slate-800 text-sm">{nombre}</span>
              </div>
              <span className="text-xs text-slate-500">{label}</span>
              <span
                className={`text-xs font-bold mt-1 ${
                  cerrado ? "text-green-700" : enCurso ? "text-amber-700" : "text-red-600"
                }`}
              >
                {cerrado
                  ? `✓ Cerrado · firmado por ${p.firmadoPor}`
                  : enCurso
                  ? "En curso..."
                  : "Sin parte aún"}
              </span>
              {p && (
                <div className="text-xs text-slate-500">
                  {p.detalles?.filter((d: any) => d.situacion === "Presente").length ?? 0} presentes ·{" "}
                  {p.detalles?.filter((d: any) => d.situacion !== "Presente").length ?? 0} ausentes
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen totales */}
      {total > 0 && (
        <div className="flex gap-4 mb-6 text-sm">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
            Presentes: {presentes}
          </div>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
            Ausentes: {ausentes}
          </div>
          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium">
            Total: {total}
          </div>
        </div>
      )}

      {/* Tabla consolidada */}
      {todosLosDet.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="px-3 py-3 text-center w-10">#</th>
                <th className="px-3 py-3 text-left">Grado</th>
                <th className="px-3 py-3 text-left">Apellido y Nombre</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-3 py-3 text-left">Causa / Observación</th>
                <th className="px-3 py-3 text-left">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {todosLosDet.map((d: any, i: number) => {
                const esAusente = d.situacion !== "Presente";
                return (
                  <tr
                    key={d.id}
                    className={`border-t ${
                      esAusente
                        ? "bg-red-50"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50"
                    }`}
                  >
                    <td className="px-3 py-2 text-center text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap text-xs">
                      {d.personal.grado}
                    </td>
                    <td className="px-3 py-2 font-medium">{d.personal.apellidoNombre}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          esAusente
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {d.situacion}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">
                      {d.causa?.causa ?? (esAusente ? "Sin causa" : "—")}
                      {d.observacion && ` · ${d.observacion}`}
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-xs">{d._unidad}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16 bg-white rounded-lg shadow">
          No hay partes cargados para esta fecha.
        </div>
      )}
    </div>
  );
}
