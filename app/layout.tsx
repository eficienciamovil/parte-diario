import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Parte Diario",
  description: "Sistema de control de asistencia militar",
};

const adminLinks = [
  { href: "/dashboard", label: "Resumen General" },
  { href: "/consolidado", label: "Consolidado" },
  { href: "/personal", label: "Personal" },
  { href: "/dependencias", label: "Dependencias" },
  { href: "/causas", label: "Causas de Ausencia" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="es" className="h-full">
      <body className="h-full flex flex-col bg-gray-50 text-gray-900">
        {session && (
          <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-md shrink-0">
            <span className="font-bold text-lg tracking-wide uppercase">Sistema de Partes</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                {session.nombre}
                {session.rol === "ADMIN" && (
                  <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                    ADMIN
                  </span>
                )}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-slate-300 hover:text-white underline transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>
          </header>
        )}

        <div className="flex flex-1 overflow-hidden">
          {session?.rol === "ADMIN" && (
            <nav className="w-56 bg-slate-700 text-slate-100 flex flex-col py-4 shrink-0">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-5 py-3 text-sm hover:bg-slate-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
