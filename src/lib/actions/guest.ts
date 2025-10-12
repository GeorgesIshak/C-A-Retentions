/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is missing');

const schema = z.object({
  uid: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
}).refine(d => d.email || d.phoneNumber, { message: 'Provide at least an email or phone number' });

export async function submitGuest(formData: FormData) {
  const parsed = schema.safeParse({
    uid: formData.get('uid'),
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
  });
  if (!parsed.success) return { ok: false, msg: 'Validation failed' };

  const { uid, fullName, email, phoneNumber } = parsed.data;

  try {
    const res = await fetch(`${API_URL}/clients/${encodeURIComponent(uid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phoneNumber }),
    });

    const text = await res.text(); // backend returns the full name (e.g., "John Doe")
    if (!res.ok) return { ok: false, msg: text || 'Backend error' };

    return { ok: true, msg: text.trim() };
  } catch (e: any) {
    return { ok: false, msg: e?.message || 'Network error' };
  }
}



export type ContactRow = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  templateId?: string | null;
};



export async function listClients(): Promise<ContactRow[]> {
  const token = (await cookies()).get('accessToken')?.value; // change if your cookie name differs

  const res = await fetch(`${API_URL}/clients`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('listClients failed:', res.status, await res.text());
    return [];
  }

  const json = await res.json();
  const items: any[] = Array.isArray(json?.data) ? json.data : [];

  return items.map((it) => ({
    id: String(it.id),
    createdAt: String(it.createdAt ?? new Date().toISOString()),
    fullName: String(it.fullName ?? ''),
    email: String(it.email ?? ''),
    phone: String(it.phoneNumber ?? ''),
    templateId: null,
  }));
}