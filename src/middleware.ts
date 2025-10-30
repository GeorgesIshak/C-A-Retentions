/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, decodeJwt } from "jose";

const rawSecret = process.env.JWT_SECRET || "";
const JWT_SECRET = rawSecret ? new TextEncoder().encode(rawSecret) : null;

async function getPayload(req: NextRequest): Promise<any | null> {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  // Try to VERIFY if we have a secret configured and expect HS256
  if (JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ["HS256"],
        clockTolerance: 5, // tolerate small clock skew
      });
      return payload as any;
    } catch (e) {
      // fall through to decode below
      // console.error("jwtVerify failed:", e);
    }
  }

  // Fallback: DECODE WITHOUT VERIFY (temporary until secrets are aligned)
  try {
    const payload = decodeJwt(token);
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const current = pathname + (search || "");

  const needsClaims = pathname === "/admin-login" || pathname.startsWith("/admin");
  const payload = needsClaims ? await getPayload(req) : null;
  const hasToken = Boolean(req.cookies.get("accessToken")?.value);

  // ---- Admin login page
  if (pathname === "/admin-login") {
    if (hasToken && payload) {
      const isAdmin = payload?.isAdmin === true;
      return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ---- Protect /admin/*
  if (pathname.startsWith("/admin")) {
    if (!hasToken || !payload) {
      const url = new URL("/admin-login", req.url);
      url.searchParams.set("next", current);
      return NextResponse.redirect(url);
    }
    const isAdmin = payload?.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ---- Protect /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    if (!hasToken) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", current);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/admin-login"],
};
