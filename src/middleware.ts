import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isBilling = pathname === "/billing";

  const session = req.cookies.get("session")?.value;      // set by login
  const sub = req.cookies.get("subscription")?.value;     // set by “purchase”

  // Protect /dashboard/*
  if (isDashboard) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (sub !== "active") {
      const url = req.nextUrl.clone();
      url.pathname = "/billing";
      url.searchParams.set("reason", "no-subscription");
      return NextResponse.redirect(url);
    }
  }

  // Visiting /billing when logged out → force login
  if (isBilling && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/billing");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/billing"],
};
