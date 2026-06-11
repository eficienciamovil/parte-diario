import { getCausas } from "@/app/actions/causas";
import CausasClient from "./CausasClient";

export default async function CausasPage() {
  const causas = await getCausas();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Causas de Ausencia</h1>
      <CausasClient causas={causas} />
    </div>
  );
}
