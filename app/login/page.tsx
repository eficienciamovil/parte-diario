"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
            Sistema de Partes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Control de asistencia militar</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {state?.error && (
            <p className="text-red-600 text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-slate-800 text-white rounded py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
