import { getDependencias } from "@/app/actions/dependencias";
import Link from "next/link";

export default async function DependenciasPage() {
  const dependencias = await getDependencias();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dependencias</h1>
        <Link
          href="/dependencias/nueva"
          className="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-600"
        >
          Nueva Dependencia
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Área Superior</th>
              <th className="text-left px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dependencias.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay dependencias cargadas.
                </td>
              </tr>
            )}
            {dependencias.map((dep: any) => (
              <tr key={dep.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{dep.codigo}</td>
                <td className="px-4 py-3 font-medium">{dep.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{dep.areaSuperior ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600">{dep.responsable ?? "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      dep.activa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {dep.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/dependencias/${dep.id}`}
                    className="text-slate-700 hover:underline text-xs"
                  >
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
