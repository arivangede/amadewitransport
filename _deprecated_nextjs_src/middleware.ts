import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Temporarily disable register route
  if (pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (isAdminPage && !isAuthPage) {
    const token = req.cookies.get("token")?.value;
    const isValid = token && verifyToken(token);

    if (!isValid) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
