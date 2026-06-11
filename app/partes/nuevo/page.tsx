import { getDependencias } from "@/app/actions/dependencias";
import NuevoParteClient from "./NuevoParteClient";
import { format } from "date-fns";

export default async function NuevoPartePage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const hoy = format(new Date(), "yyyy-MM-dd");
  const fecha = params.fecha ?? hoy;

  const dependencias = await getDependencias();
  const activas = dependencias.filter((d: any) => d.activa);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Parte Diario</h1>
      <NuevoParteClient dependencias={activas} fechaDefault={fecha} />
    </div>
  );
}
