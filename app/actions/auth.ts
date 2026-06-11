"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const usuario = formData.get("usuario") as string;
  const password = formData.get("password") as string;

  if (!usuario || !password) {
    return { error: "Complete todos los campos" };
  }

  const user = await (db as any).usuario.findUnique({
    where: { usuario },
    include: { dependencia: true },
  });

  if (!user) return { error: "Usuario o contraseña incorrectos" };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Usuario o contraseña incorrectos" };

  await createSession({
    userId: user.id,
    rol: user.rol,
    dependenciaId: user.dependenciaId ?? null,
    nombre: user.nombre,
  });

  redirect(user.rol === "ADMIN" ? "/dashboard" : "/unidad");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
