import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/admin/dashboard", "/admin/form"];
const adminOnlyRoutes = ["/admin/settings"]; // Example of RBAC restricted area

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie || "");

  if (!session?.user) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  // RBAC implementation example
  // Only superadmin can access adminOnlyRoutes
  const isAdminRoute = adminOnlyRoutes.some(route => path.startsWith(route));
  const role = (session.user as { role?: string })?.role;
  if (isAdminRoute && role !== "superadmin") {
    // return 403 or redirect
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
