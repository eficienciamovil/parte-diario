import { getPersonal } from "@/app/actions/personal";
import Link from "next/link";
import ImportarPersonalBtn from "./ImportarPersonalBtn";
import { sortPorGrado } from "@/lib/grado-order";

export default async function PersonalPage() {
  const personalRaw = await getPersonal();
  const personal = sortPorGrado(personalRaw, (p: any) => p.grado, (p: any) => p.apellidoNombre);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Personal</h1>
        <div className="flex gap-2">
          <ImportarPersonalBtn />
          <Link
            href="/personal/nuevo"
            className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600"
          >
            Nuevo Personal
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-center px-3 py-3 w-10">#</th>
              <th className="text-left px-4 py-3">Grado</th>
              <th className="text-left px-4 py-3">Apellido y Nombre</th>
              <th className="text-left px-4 py-3">DNI / Legajo</th>
              <th className="text-left px-4 py-3">Cargo</th>
              <th className="text-left px-4 py-3">Dependencia</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {personal.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No hay personal cargado.
                </td>
              </tr>
            )}
            {personal.map((p: any, i: number) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.estado !== "Activo" ? "opacity-60" : ""}`}>
                <td className="px-3 py-3 text-center text-slate-400 text-xs font-mono">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.grado}</td>
                <td className="px-4 py-3">{p.apellidoNombre}</td>
                <td className="px-4 py-3 text-gray-600">{p.dni ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600">{p.cargo ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600">{p.dependencia.nombre}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : p.estado === "Pase"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/personal/${p.id}`} className="text-slate-700 hover:underline text-xs">
                    Editar
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
