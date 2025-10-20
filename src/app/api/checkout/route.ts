/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';        // ensure Node runtime (not Edge)
export const dynamic = 'force-dynamic'; // avoid static evaluation

export async function POST(req: Request) {
  try {
    // Read env at runtime
    const API_URL = process.env.BACKEND_API_URL;
    if (!API_URL) {
      console.error('BACKEND_API_URL is not set in the deployment env');
      return NextResponse.json(
        { error: 'Server misconfigured: BACKEND_API_URL not set' },
        { status: 500 }
      );
    }

    // Parse JSON body safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { priceId } = body ?? {};
    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Read access token from cookies (await form works in Edge/Node typings)
    const token = (await cookies()).get('accessToken')?.value;

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const resp = await fetch(`${API_URL}/payment/checkout-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ priceId }),
      cache: 'no-store',
    });

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
