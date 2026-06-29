import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { crearParte, getPartePorDependenciaYFecha } from "@/app/actions/partes";
import AsistenciaClient from "./AsistenciaClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sortPorGrado } from "@/lib/grado-order";

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

  let parte: any;
  let causas: any[] = [];
  try {
    parte = await getPartePorDependenciaYFecha(session.dependenciaId, hoy);

    if (!parte) {
      await crearParte({
        dependenciaId: session.dependenciaId,
        fecha: hoy.toISOString(),
        responsableCarga: session.nombre,
        _skipRevalidate: true,
      });
      parte = await getPartePorDependenciaYFecha(session.dependenciaId, hoy);
    }

    // Sincronizar parte con el personal activo: agregar faltantes y quitar dados de baja
    if (parte && parte.estado !== "Cerrado") {
      const personal = await (db as any).personal.findMany({
        where: { dependenciaId: session.dependenciaId, estado: "Activo" },
      });
      const activosIds = new Set(personal.map((p: any) => p.id));
      const yaEnParte = new Set(parte.detalles.map((d: any) => d.personalId));

      const faltantes = personal.filter((p: any) => !yaEnParte.has(p.id));
      const sobrantesIds = parte.detalles
        .filter((d: any) => !activosIds.has(d.personalId))
        .map((d: any) => d.id);

      let cambios = false;
      if (faltantes.length > 0) {
        await (db as any).detalleAsistencia.createMany({
          data: faltantes.map((p: any) => ({
            parteId: parte.id,
            personalId: p.id,
            situacion: "Presente",
          })),
        });
        cambios = true;
      }
      if (sobrantesIds.length > 0) {
        await (db as any).detalleAsistencia.deleteMany({
          where: { id: { in: sobrantesIds } },
        });
        cambios = true;
      }
      if (cambios) {
        parte = await getPartePorDependenciaYFecha(session.dependenciaId, hoy);
      }
    }

    // Ordenar detalles por grado jerárquico, luego por apellido
    if (parte) {
      parte = {
        ...parte,
        detalles: sortPorGrado(
          parte.detalles,
          (d: any) => d.personal.grado,
          (d: any) => d.personal.apellidoNombre
        ),
      };
    }

    causas = await (db as any).causaAusencia.findMany({
      where: { activa: true },
      orderBy: { causa: "asc" },
    });
  } catch (e: any) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-bold text-lg mb-2">Error al cargar el parte</h2>
        <p className="text-red-700 font-mono text-sm bg-red-100 p-3 rounded">{e?.message ?? String(e)}</p>
        <p className="text-red-600 text-xs mt-2">Stack: {e?.stack?.slice(0, 500)}</p>
      </div>
    );
  }

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
