/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const API_URL = process.env.BACKEND_API_URL;
    if (!API_URL) {
      console.error('BACKEND_API_URL is not set in the deployment env');
      return NextResponse.json({ error: 'Server misconfigured: BACKEND_API_URL not set' }, { status: 500 });
    }

    // ✅ Works in both edge (await required) and node (TS still happy)
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

    const data: any = await resp.json().catch(() => ({}));
    const url = data?.url;

    if (!url) {
      return NextResponse.json({ error: 'Backend returned no portal URL' }, { status: 500 });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
