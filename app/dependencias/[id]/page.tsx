import { getDependencia } from "@/app/actions/dependencias";
import DependenciaForm from "@/app/components/DependenciaForm";
import { notFound } from "next/navigation";

export default async function EditarDependenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dep = await getDependencia(Number(id));
  if (!dep) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Dependencia</h1>
      <DependenciaForm dependencia={dep} />
    </div>
  );
}
