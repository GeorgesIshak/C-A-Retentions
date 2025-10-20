/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/checkout/route.ts

import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/actions/auth';

export async function POST(req: Request) {
  const API_URL = process.env.BACKEND_API_URL;

  // ✅ Handle missing variable gracefully at runtime instead of throwing at build
  if (!API_URL) {
    return NextResponse.json(
      { error: 'BACKEND_API_URL is not defined in environment variables' },
      { status: 500 }
    );
  }

  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // 🪪 Use fetchWithAuth — automatically attaches token and handles refresh
    const resp = await fetchWithAuth(`${API_URL}/payment/checkout-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    // 🔐 Handle unauthorized
    if (resp.status === 401) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    // ❌ Handle other errors
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return NextResponse.json(
        { error: text || 'Failed to create checkout session' },
        { status: resp.status || 500 }
      );
    }

    // ✅ Success
    const data = await resp.json().catch(() => ({}));
    const url = data?.url;
    if (!url) {
      return NextResponse.json({ error: 'Backend returned no checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    console.error('checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
