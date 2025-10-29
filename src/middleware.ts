/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// ✅ Verify and extract payload
async function getPayload(req: NextRequest): Promise<any | null> {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"], // make sure this matches your backend
      clockTolerance: 5,
    });
    return payload as any;
  } catch (e) {
    console.error("JWT verification failed:", e);
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
      const url = new URL("/admin-login", req.url);
      url.searchParams.set("error", "You are not an admin");
      return NextResponse.redirect(url);
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
