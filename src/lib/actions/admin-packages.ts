/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';
import type { Package } from '@/types/packagePlan';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

async function readErr(res: Response, fallback: string): Promise<string> {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body: any = await res.json().catch(() => ({}));
      const m = body?.message ?? body?.error ?? body?.detail;
      return Array.isArray(m) ? m.join(', ') : (m || fallback);
    }
    const text = await res.text().catch(() => '');
    return text || fallback;
  } catch {
    return fallback;
  }
}

const toInt = (v: FormDataEntryValue | null, def = 0) => {
  const n = Number(v ?? def);
  return Number.isFinite(n) ? Math.trunc(n) : def;
};
const toNum = (v: FormDataEntryValue | null, def = 0) => {
  const n = Number(v ?? def);
  return Number.isFinite(n) ? n : def;
};
const toBool = (v: FormDataEntryValue | null, def = true) => {
  const s = String(v ?? '');
  if (s === '') return def;
  return s === 'true' || s === 'on' || s === '1' || s === 'yes';
};

/** === CREATE PACKAGE (ADMIN ONLY) === */
export async function createPackage(formData: FormData): Promise<Package> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const body = {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    durationDays: toInt(formData.get('durationDays'), 0),
    smsCount: toInt(formData.get('smsCount'), 0),
    emailCount: toInt(formData.get('emailCount'), 0),
    price: toNum(formData.get('price'), 0),
    isActive: toBool(formData.get('isActive'), true),
  };

  const res = await fetch(`${API_URL}/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to create package.');
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ({} as any));
  return (json?.data ?? json) as Package;
}

/** === LIST PACKAGES (GET ALL) === */
export async function listPackages(): Promise<Package[]> {
  const res = await fetch(`${API_URL}/packages`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch packages.');
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ([] as any));
  const data = Array.isArray(json) ? json : (json?.data ?? []);
  return data as Package[];
}


/** === DELETE PACKAGE (ADMIN ONLY) === */
export async function deletePackage(id: string) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to delete package.');
    throw new Error(msg);
  }

  return true;
}

/** === UPDATE PACKAGE (ADMIN ONLY) === */
export async function updatePackage(
  id: string,
  payload: FormData | Partial<Pick<Package,
    'name' | 'description' | 'durationDays' | 'smsCount' | 'emailCount' | 'price' | 'isActive'
  >>
): Promise<Package> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  // Support both FormData (from a <form>) and plain object (from a client call)
  const body =
    payload instanceof FormData
      ? {
          name: String(payload.get('name') ?? '').trim(),
          description: String(payload.get('description') ?? '').trim(),
          durationDays: toInt(payload.get('durationDays')),
          smsCount: toInt(payload.get('smsCount')),
          emailCount: toInt(payload.get('emailCount')),
          price: toNum(payload.get('price')),
          isActive: toBool(payload.get('isActive'), true),
        }
      : {
          ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
          ...(payload.description !== undefined ? { description: String(payload.description).trim() } : {}),
          ...(payload.durationDays !== undefined ? { durationDays: Number(payload.durationDays) | 0 } : {}),
          ...(payload.smsCount !== undefined ? { smsCount: Number(payload.smsCount) | 0 } : {}),
          ...(payload.emailCount !== undefined ? { emailCount: Number(payload.emailCount) | 0 } : {}),
          ...(payload.price !== undefined ? { price: Number(payload.price) || 0 } : {}),
          ...(payload.isActive !== undefined ? { isActive: Boolean(payload.isActive) } : {}),
        };

  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,         // ← important
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to update package.');
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ({} as any));
  return (json?.data ?? json) as Package;
}
