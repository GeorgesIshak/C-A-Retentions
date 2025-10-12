/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Base64URL decode for Edge runtime (no Buffer in middleware)
function decodeJwtPayload<T = any>(jwt: string): T | undefined {
  try {
    const payload = jwt.split(".")[1] || "";
    const pad = "=".repeat((4 - (payload.length % 4)) % 4);
    const base64 = (payload + pad).replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64); // Edge runtime: atob is available
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

type JWTPayload = {
  email?: string;
  exp?: number; // seconds since epoch
};

const OWNER_EMAIL = (process.env.OWNER_EMAIL || "").toLowerCase();

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  // helper: current path + search to round-trip as ?next=
  const currentPathWithQuery = pathname + (search || "");

  // ---- utility: parse token (email + expiry) ----
  const payload = token ? decodeJwtPayload<JWTPayload>(token) : undefined;
  const email = (payload?.email || "").toLowerCase();
  const isExpired =
    typeof payload?.exp === "number" ? payload!.exp * 1000 <= Date.now() : false;

  // ===========================
  // Normal User Dashboard Gate
  // ===========================
  if (pathname.startsWith("/dashboard")) {
    // No token or expired → login
    if (!token || isExpired) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", currentPathWithQuery);
      return NextResponse.redirect(url);
    }

    // If it's the owner, bounce them to Admin
    if (email === OWNER_EMAIL) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // ==================
  // Admin Gate
  // ==================
  if (pathname.startsWith("/admin")) {
    // Allow hitting the admin login screen without token
    if (pathname === "/admin-login") {
      return NextResponse.next();
    }

    // No token or expired → admin-login
    if (!token || isExpired) {
      const url = new URL("/admin-login", req.url);
      url.searchParams.set("next", currentPathWithQuery);
      return NextResponse.redirect(url);
    }

    // Has token: only owner may pass
    if (email !== OWNER_EMAIL) {
      // Non-admin: send to user dashboard (will stay there due to check above)
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// Only run on /dashboard/* and /admin/*
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
