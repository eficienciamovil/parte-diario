import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { crearParte, getPartePorDependenciaYFecha } from "@/app/actions/partes";
import AsistenciaClient from "./AsistenciaClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function UnidadPage() {
  const session = await verifySession();

  if (!session.dependenciaId) {
    return (
      <div className="text-center text-slate-500 mt-20">
        Este usuario no tiene una unidad asignada. Contacte al administrador.
      </div>
    );
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let parte = await getPartePorDependenciaYFecha(session.dependenciaId, hoy);

  // Si no existe el parte de hoy, crearlo automáticamente
  if (!parte) {
    await crearParte({
      dependenciaId: session.dependenciaId,
      fecha: hoy.toISOString(),
      responsableCarga: session.nombre,
    });
    parte = await getPartePorDependenciaYFecha(session.dependenciaId, hoy);
  }

  const causas = await (db as any).causaAusencia.findMany({
    where: { activa: true },
    orderBy: { causa: "asc" },
  });

  const fechaStr = format(hoy, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {parte?.dependencia.nombre}
        </h1>
        <p className="text-slate-500 text-sm capitalize mt-1">
          Parte del {fechaStr}
        </p>
        {parte?.estado === "Cerrado" && (
          <div className="mt-2 inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <span>✓</span> Parte cerrado y enviado al administrador
          </div>
        )}
      </div>

      {parte ? (
        <AsistenciaClient parte={parte as any} causas={causas} />
      ) : (
        <p className="text-slate-500">No se pudo cargar el parte. Recargue la página.</p>
      )}
    </div>
  );
}
