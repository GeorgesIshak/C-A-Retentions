/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/billing-portal/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const API_URL = process.env.BACKEND_API_URL;

  // ✅ Handle missing variable gracefully (so build doesn’t fail)
  if (!API_URL) {
    return NextResponse.json(
      { error: 'BACKEND_API_URL is not defined in environment variables' },
      { status: 500 }
    );
  }

  try {
    const token = (await cookies()).get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resp = await fetch(`${API_URL}/payment/portal`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return NextResponse.json(
        { error: text || 'Failed to create billing portal session' },
        { status: resp.status || 500 }
      );
    }

    const data = await resp.json().catch(() => ({}));
    const url = data?.url;
    if (!url) {
      return NextResponse.json({ error: 'Backend returned no portal URL' }, { status: 500 });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    console.error('billing-portal error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
