import { getDependencias } from "@/app/actions/dependencias";
import PersonalForm from "@/app/components/PersonalForm";

export default async function NuevoPersonalPage() {
  const dependencias = await getDependencias();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Personal</h1>
      <PersonalForm dependencias={dependencias} />
    </div>
  );
}
