// src/app/api/packages/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, packages: [] });
}

// optional stub
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: body }, { status: 201 });
}
