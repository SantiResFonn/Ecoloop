import { NextResponse, type NextRequest } from "next/server";

type SessionPayload = {
  id?: string;
  email?: string;
  role?: "user" | "worker" | "admin" | string;
  token?: string;
};

function parseSession(cookieValue?: string): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded) as SessionPayload;
  } catch {
    return null;
  }
}

function dashboardPathFor(role?: string): string {
  if (role === "admin") return "/admin";
  if (role === "worker") return "/worker";
  return "/user";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("ecoloop_session")?.value;
  const user = parseSession(sessionCookie);

  const isAuthPath = pathname.startsWith("/auth");
  const isAdminPath = pathname.startsWith("/admin");
  const isWorkerPath = pathname.startsWith("/worker");
  const isUserPath = pathname.startsWith("/user");
  const isRoot = pathname === "/";

  // 1. Sin sesión: bloquear dashboards privados
  if (!user) {
    if (isAdminPath || isWorkerPath || isUserPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Con sesión: redirigir desde root o auth al dashboard del rol
  if (isRoot || isAuthPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardPathFor(user.role);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Prevenir acceso cruzado entre roles
  if (isAdminPath && user.role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardPathFor(user.role);
    return NextResponse.redirect(redirectUrl);
  }
  if (isWorkerPath && user.role !== "worker" && user.role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardPathFor(user.role);
    return NextResponse.redirect(redirectUrl);
  }
  if (isUserPath && user.role !== "user") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardPathFor(user.role);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
