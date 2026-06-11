import { getPersonaById } from "@/app/actions/personal";
import { getDependencias } from "@/app/actions/dependencias";
import PersonalForm from "@/app/components/PersonalForm";
import { notFound } from "next/navigation";

export default async function EditarPersonalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [persona, dependencias] = await Promise.all([
    getPersonaById(Number(id)),
    getDependencias(),
  ]);
  if (!persona) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Personal</h1>
      <PersonalForm persona={persona} dependencias={dependencias} />
    </div>
  );
}
