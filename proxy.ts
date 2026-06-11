import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!);

async function decrypt(session: string | undefined) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return payload as { userId?: number; rol?: string };
  } catch {
    return null;
  }
}

const publicRoutes = ["/login"];
const adminOnlyRoutes = ["/personal", "/dependencias", "/causas", "/consolidado", "/dashboard"];
const unitOnlyRoutes = ["/unidad"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // Sin sesión: solo puede ver rutas públicas
  if (!session?.userId) {
    if (publicRoutes.some((r) => path.startsWith(r))) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Con sesión: redirigir fuera del login
  if (path.startsWith("/login")) {
    return NextResponse.redirect(
      new URL(session.rol === "ADMIN" ? "/dashboard" : "/unidad", req.nextUrl)
    );
  }

  // Usuario de unidad intentando acceder a rutas de admin
  if (session.rol !== "ADMIN" && adminOnlyRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/unidad", req.nextUrl));
  }

  // Admin intentando acceder a /unidad (no tiene sentido, redirigir a dashboard)
  if (session.rol === "ADMIN" && unitOnlyRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
