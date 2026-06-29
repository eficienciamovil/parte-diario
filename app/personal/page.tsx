import { getPersonal } from "@/app/actions/personal";
import Link from "next/link";
import ImportarPersonalBtn from "./ImportarPersonalBtn";
import PersonalTable from "./PersonalTable";
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

      <PersonalTable personal={personal} />
    </div>
  );
}
