/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is missing');

// ---------- helpers ----------
const toUndef = (v: unknown) =>
  typeof v === 'string' ? (v.trim() === '' ? undefined : v.trim()) : undefined;

// ---------- schema ----------
const schema = z.object({
  uid: z.string().min(1, 'Missing uid'),
  fullName: z
    .string()
    .transform(s => (typeof s === 'string' ? s.trim() : s))
    .pipe(z.string().min(2, 'Full name must be at least 2 chars')),
  email: z.preprocess(toUndef, z.string().email('Invalid email').optional()),
  phoneNumber: z.preprocess(toUndef, z.string().optional()),
}).refine(d => d.email || d.phoneNumber, { message: 'Provide at least an email or phone number' });

export async function submitGuest(formData: FormData) {
  const parsed = schema.safeParse({
    uid: formData.get('uid'),
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
  });
  if (!parsed.success) {
    return { ok: false, msg: 'Validation failed' };
  }

  const { uid, fullName, email, phoneNumber } = parsed.data;

  try {
    const res = await fetch(`${API_URL}/clients/${encodeURIComponent(uid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // guest form likely public; keep if backend expects JSON
      body: JSON.stringify({ fullName, email, phoneNumber }),
      cache: 'no-store',
    });

    const text = await res.text();
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
  try {
    const token = (await cookies()).get('accessToken')?.value;

    const res = await fetch(`${API_URL}/clients`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    });

    if (!res.ok) {
      const brief = (await res.text()).slice(0, 300);
      console.error('listClients failed:', res.status, brief);
      return [];
    }

    const json = await res.json().catch(() => null);
    const items: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

    return items.map((it) => ({
      id: String(it.id ?? ''),
      createdAt: new Date(it.createdAt ?? Date.now()).toISOString(),
      fullName: String(it.fullName ?? ''),
      email: String(it.email ?? ''),
      phone: String(it.phoneNumber ?? ''),
      templateId: null,
    }));
  } catch (e: any) {
    console.error('listClients failed:', (e?.message || String(e)).slice(0, 200));
    return [];
  }
}
