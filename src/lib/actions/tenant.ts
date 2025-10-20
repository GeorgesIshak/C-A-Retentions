/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { fetchWithAuth } from '@/lib/actions/auth';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

export async function getTenantProfile(): Promise<any | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/profile`, { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getTenantProfile error:', err);
    return null;
  }
}
