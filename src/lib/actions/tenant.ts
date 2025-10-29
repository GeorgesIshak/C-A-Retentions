/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { fetchWithAuth } from '@/lib/actions/auth';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

/**
 * GET tenant profile
 */
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

/**
 * PUT update tenant profile (fullName, businessName, phoneNumber)
 */
export async function updateTenantProfile(data: {
  fullName?: string;
  businessName?: string;
  phoneNumber?: string;
}): Promise<any | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('updateTenantProfile failed:', res.status, await res.text());
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('updateTenantProfile error:', err);
    return null;
  }
}
