/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/actions/auth';

export const runtime = 'nodejs';        // ensure Node runtime (not Edge)
export const dynamic = 'force-dynamic'; // avoid static evaluation

export async function POST(req: Request) {
  try {
    // Read env at runtime (not module top-level)
    const API_URL = process.env.BACKEND_API_URL;
    if (!API_URL) {
      console.error('BACKEND_API_URL is not set in the deployment env');
      return NextResponse.json(
        { error: 'Server misconfigured: BACKEND_API_URL not set' },
        { status: 500 }
      );
    }

    // Safely parse body (req.json() can throw)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { priceId } = body ?? {};
    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Use fetchWithAuth — should add auth header & refresh if needed
    const resp = await fetchWithAuth(`${API_URL}/payment/checkout-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
      // no-store avoids any caching weirdness
      cache: 'no-store',
    });

    // If refresh failed and backend still returns 401
    if (resp.status === 401) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return NextResponse.json(
        { error: text || 'Failed to create checkout session' },
        { status: resp.status || 500 }
      );
    }

    const data: any = await resp.json().catch(() => ({}));
    const url: string | undefined = data?.url;
    if (!url) {
      return NextResponse.json(
        { error: 'Backend returned no checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    console.error('checkout error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
