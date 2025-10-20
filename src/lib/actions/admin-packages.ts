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
const toOptStr = (v: FormDataEntryValue | null | undefined) => {
  const s = (v ?? '').toString().trim();
  return s.length ? s : undefined;
};

/** Read a boolean from a form: true only if a true-ish value is present */
function formBool(fd: FormData, name: string, defaultValue = false) {
  const vals = fd.getAll(name).map(v => String(v).toLowerCase());
  if (vals.length === 0) return defaultValue;
  return vals.some(v => v === 'true' || v === 'on' || v === '1' || v === 'yes');
}

/** Normalize BE payloads -> Package */
function normalizePackage(raw: any): Package {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: raw.description ?? null,
    durationDays: Number(raw.durationDays) || 0,
    smsCount: Number(raw.smsCount) || 0,
    emailCount: Number(raw.emailCount) || 0,
    price: typeof raw.price === 'string' ? Number(raw.price) : Number(raw.price || 0),
    isActive: Boolean(raw.isActive),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    priceId: raw.priceId ? String(raw.priceId) : null,
  };
}

/** === CREATE PACKAGE (ADMIN ONLY) === */
export async function createPackage(formData: FormData): Promise<Package> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const priceId = toOptStr(formData.get('priceId'));
  if (!priceId) throw new Error('Stripe priceId is required.');

  const body: Record<string, any> = {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    durationDays: toInt(formData.get('durationDays'), 0),
    smsCount: toInt(formData.get('smsCount'), 0),
    emailCount: toInt(formData.get('emailCount'), 0),
    price: toNum(formData.get('price'), 0),
    isActive: formBool(formData, 'isActive', false),  // ← fixed
    priceId,                                          // ← required
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

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return normalizePackage(raw);
}

/** === LIST PACKAGES (supports filters) === */
type ListParams = { active?: boolean; page?: number; limit?: number };
export async function listPackages(params?: ListParams): Promise<Package[]> {
  const url = new URL(`${API_URL}/packages`);
  if (params?.active !== undefined) url.searchParams.set('active', String(params.active));
  if (params?.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params?.limit !== undefined) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch packages.');
    throw new Error(msg);
  }

  const json: any = await res.json().catch(() => ([]));
  const list = Array.isArray(json) ? json : (json?.data ?? []);
  return (list as any[]).map(normalizePackage);
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
  payload:
    | FormData
    | Partial<
        Pick<
          Package,
          | 'name'
          | 'description'
          | 'durationDays'
          | 'smsCount'
          | 'emailCount'
          | 'price'
          | 'isActive'
          | 'priceId'
        >
      >
): Promise<Package> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const body =
    payload instanceof FormData
      ? (() => {
          const b: Record<string, any> = {
            name: toOptStr(payload.get('name')),
            description: toOptStr(payload.get('description')),
            durationDays: payload.get('durationDays') != null ? toInt(payload.get('durationDays')) : undefined,
            smsCount: payload.get('smsCount') != null ? toInt(payload.get('smsCount')) : undefined,
            emailCount: payload.get('emailCount') != null ? toInt(payload.get('emailCount')) : undefined,
            price: payload.get('price') != null ? toNum(payload.get('price')) : undefined,
            isActive: formBool(payload, 'isActive', false), // ← fixed
            priceId: toOptStr(payload.get('priceId')),      // ← editable
          };
          // Enforce priceId required on update if the field is present but empty
          if ('priceId' in b && (b.priceId === undefined || b.priceId === '')) {
            throw new Error('Stripe priceId is required.');
          }
          return b;
        })()
      : {
          ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
          ...(payload.description !== undefined ? { description: String(payload.description).trim() } : {}),
          ...(payload.durationDays !== undefined ? { durationDays: Number(payload.durationDays) | 0 } : {}),
          ...(payload.smsCount !== undefined ? { smsCount: Number(payload.smsCount) | 0 } : {}),
          ...(payload.emailCount !== undefined ? { emailCount: Number(payload.emailCount) | 0 } : {}),
          ...(payload.price !== undefined ? { price: Number(payload.price) || 0 } : {}),
          ...(payload.isActive !== undefined ? { isActive: Boolean(payload.isActive) } : {}),
          ...(payload.priceId !== undefined ? { priceId: String(payload.priceId) } : {}),
        };

  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to update package.');
    throw new Error(msg);
  }

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return normalizePackage(raw);
}


/* ===================== SUBSCRIBERS (with pagination) ===================== */

export type SubscriberPayment = {
  id: string;
  packageName: string | null;
  expiryDate: string | null;   // ISO
};

export type Subscriber = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;           // ISO
  payments: SubscriberPayment[];
};

function normalizeSubscriber(raw: any): Subscriber {
  const payments = Array.isArray(raw?.payments) ? raw.payments : [];
  return {
    id: String(raw?.id ?? ''),
    email: String(raw?.email ?? ''),
    emailVerified: Boolean(raw?.emailVerified),
    createdAt: String(raw?.createdAt ?? ''),
    payments: payments.map((p: any): SubscriberPayment => ({
      id: String(p?.id ?? ''),
      packageName: p?.packageName != null ? String(p.packageName) : null,
      expiryDate: p?.expiryDate != null ? String(p.expiryDate) : null,
    })),
  };
}

/** Returned shape that matches your BE pagination */
export type SubscriberListPage = {
  items: Subscriber[];
  total: number;
  totalPages: number;
  currentPage: number;
};

/** === LIST SUBSCRIBERS (paginated) ===
 * Matches the BE response you sent:
 * { data: [...], total, totalPages, currentPage }
 */
export async function listSubscribersPage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  emailVerified?: boolean;
}): Promise<SubscriberListPage> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const url = new URL(`${API_URL}/users/subscribers`);
  if (params?.page != null)  url.searchParams.set('page', String(params.page));
  if (params?.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params?.search)        url.searchParams.set('search', params.search);
  if (params?.email)         url.searchParams.set('email', params.email);
  if (params?.emailVerified !== undefined) {
    url.searchParams.set('emailVerified', String(params.emailVerified));
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch subscribers.');
    throw new Error(msg);
  }

  const json: any = await res.json().catch(() => ({}));
  const data = Array.isArray(json?.data) ? json.data : [];
  return {
    items: data.map(normalizeSubscriber),
    total: Number(json?.total ?? data.length) || 0,
    totalPages: Number(json?.totalPages ?? 1) || 1,
    currentPage: Number(json?.currentPage ?? 1) || 1,
  };
}

/** === Convenience: just return the array (first page by default) === */
export async function listSubscribers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  emailVerified?: boolean;
}): Promise<Subscriber[]> {
  const page = await listSubscribersPage(params);
  return page.items;
}

/** === Optional: get a single subscriber by id === */
export async function getSubscriber(id: string): Promise<Subscriber> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Missing access token — please log in first.');

  const res = await fetch(`${API_URL}/users/subscribers/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch subscriber.');
    throw new Error(msg);
  }

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return normalizeSubscriber(raw);
}
