import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("t"); // tenant token from QR

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email || !body?.phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 🚧 DEV ONLY: pretend to save
  // Here you would: look up tenant by token, insert contact into DB.
  console.log("New contact for token:", token, body);

  return NextResponse.json({ ok: true });
}
