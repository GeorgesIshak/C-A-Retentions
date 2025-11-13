/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';
import type { Package } from '@/types/packagePlan';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

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

/** Centralised network-safe fetch */
async function safeFetch(
  url: string | URL,
  init: RequestInit,
  context: string
): Promise<{ res: Response | null; error?: string }> {
  try {
    const res = await fetch(url.toString(), init);
    return { res };
  } catch (err) {
    console.error(`[API NETWORK ERROR] ${context}:`, err);
    return {
      res: null,
      error: 'Cannot reach server. Please check your connection and try again.',
    };
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

/** Read a boolean from a form */
function formBool(fd: FormData, name: string, defaultValue = false) {
  const vals = fd.getAll(name).map((v) => String(v).toLowerCase());
  if (vals.length === 0) return defaultValue;
  return vals.some((v) => v === 'true' || v === 'on' || v === '1' || v === 'yes');
}

/** Normalise BE payloads -> Package */
function normalizePackage(raw: any): Package {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: raw.description ?? null,
    durationDays: Number(raw.durationDays) || 0,
    smsCount: Number(raw.smsCount) || 0,
    emailCount: Number(raw.emailCount) || 0,
     whatsappCount: Number(raw.whatsappCount) || 0,
    price: typeof raw.price === 'string' ? Number(raw.price) : Number(raw.price || 0),
    isActive: Boolean(raw.isActive),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    priceId: raw.priceId ? String(raw.priceId) : null,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Admin: Packages                               */
/* -------------------------------------------------------------------------- */

/** === CREATE PACKAGE === */
export async function createPackage(formData: FormData) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return { ok: false, error: 'Missing access token — please log in first.' };

  const priceId = toOptStr(formData.get('priceId'));
  if (!priceId) return { ok: false, error: 'Stripe priceId is required.' };

  const body = {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    durationDays: toInt(formData.get('durationDays'), 0),
    smsCount: toInt(formData.get('smsCount'), 0),
    emailCount: toInt(formData.get('emailCount'), 0),
    whatsappCount: toInt(formData.get('whatsappCount'), 0),

    price: toNum(formData.get('price'), 0),
    isActive: formBool(formData, 'isActive', false),
    priceId,
  };

  const { res, error } = await safeFetch(
    `${API_URL}/packages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
    'createPackage'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to create package.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to create package.');
    return { ok: false, error: msg };
  }

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return { ok: true, data: normalizePackage(raw) };
}

/** === LIST PACKAGES === */
type ListParams = { active?: boolean; page?: number; limit?: number };

export async function listPackages(params?: ListParams): Promise<Package[]> {
  const url = new URL(`${API_URL}/packages`);
  if (params?.active !== undefined) url.searchParams.set('active', String(params.active));
  if (params?.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params?.limit !== undefined) url.searchParams.set('limit', String(params.limit));

  const { res, error } = await safeFetch(
    url,
    { method: 'GET', cache: 'no-store' },
    'listPackages'
  );

  // Network error → log and return empty list
  if (!res) {
    console.error('listPackages network error:', error);
    return [];
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch packages.');
    console.error('listPackages error:', msg);
    return [];
  }

  const json: any = await res.json().catch(() => []);
  const list = Array.isArray(json) ? json : json?.data ?? [];
  return (list as any[]).map(normalizePackage);
}

/** === DELETE PACKAGE === */
export async function deletePackage(id: string) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return { ok: false, error: 'Missing access token — please log in first.' };

  const { res, error } = await safeFetch(
    `${API_URL}/packages/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
    'deletePackage'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to delete package.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to delete package.');
    return { ok: false, error: msg };
  }

  return { ok: true };
}

/** === UPDATE PACKAGE === */
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
          | 'whatsappCount'
          | 'price'
          | 'isActive'
          | 'priceId'
        >
      >
) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return { ok: false, error: 'Missing access token — please log in first.' };

  let body: Record<string, any> = {};
  try {
    body =
      payload instanceof FormData
        ? (() => {
            const b: Record<string, any> = {
              name: toOptStr(payload.get('name')),
              description: toOptStr(payload.get('description')),
              durationDays:
                payload.get('durationDays') != null ? toInt(payload.get('durationDays')) : undefined,
              smsCount:
                payload.get('smsCount') != null ? toInt(payload.get('smsCount')) : undefined,
              emailCount:
                payload.get('emailCount') != null ? toInt(payload.get('emailCount')) : undefined,
                  whatsappCount:
                payload.get('whatsappCount') != null ? toInt(payload.get('whatsappCount')) : undefined,
              price: payload.get('price') != null ? toNum(payload.get('price')) : undefined,
              isActive: formBool(payload, 'isActive', false),
              priceId: toOptStr(payload.get('priceId')),
            };
            if ('priceId' in b && (b.priceId === undefined || b.priceId === '')) {
              throw new Error('Stripe priceId is required.');
            }
            return b;
          })()
        : payload;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }

  const { res, error } = await safeFetch(
    `${API_URL}/packages/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
    'updatePackage'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to update package.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to update package.');
    return { ok: false, error: msg };
  }

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return { ok: true, data: normalizePackage(raw) };
}

/* -------------------------------------------------------------------------- */
/*                              Subscribers                                   */
/* -------------------------------------------------------------------------- */

export type SubscriberPayment = {
  id: string;
  packageName: string | null;
  expiryDate: string | null;
};

export type Subscriber = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
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

/** Paginated list */
export async function listSubscribersPage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  emailVerified?: boolean;
}) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return { ok: false, error: 'Missing access token — please log in first.' };

  const url = new URL(`${API_URL}/users/subscribers`);
  if (params?.page != null) url.searchParams.set('page', String(params.page));
  if (params?.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.email) url.searchParams.set('email', params.email);
  if (params?.emailVerified !== undefined) {
    url.searchParams.set('emailVerified', String(params.emailVerified));
  }

  const { res, error } = await safeFetch(
    url,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
    'listSubscribersPage'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to fetch subscribers.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch subscribers.');
    return { ok: false, error: msg };
  }

  const json: any = await res.json().catch(() => ({}));
  const data = Array.isArray(json?.data) ? json.data : [];
  return {
    ok: true,
    data: data.map(normalizeSubscriber),
    total: Number(json?.total ?? data.length) || 0,
    totalPages: Number(json?.totalPages ?? 1) || 1,
    currentPage: Number(json?.currentPage ?? 1) || 1,
  };
}

/** Get single subscriber */
export async function getSubscriber(id: string) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return { ok: false, error: 'Missing access token — please log in first.' };

  const { res, error } = await safeFetch(
    `${API_URL}/users/subscribers/${id}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
    'getSubscriber'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to fetch subscriber.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to fetch subscriber.');
    return { ok: false, error: msg };
  }

  const json: any = await res.json().catch(() => ({}));
  const raw = json?.data ?? json;
  return { ok: true, data: normalizeSubscriber(raw) };
}

/* -------------------------------------------------------------------------- */
/*                              Admin: Send Emails                            */
/* -------------------------------------------------------------------------- */

export type AdminEmailTemplate = {
  subject: string;
  html: string;
};

export async function sendAdminEmails(input: {
  name: string; // e.g. "bulk"
  emails: string[]; // e.g. ["ishak.george0@gmail.com"]
  emailTemplate: AdminEmailTemplate;
}) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) {
    return { ok: false, error: 'Missing access token — please log in first.' };
  }

  const body = {
    name: input.name,
    emails: input.emails,
    emailTemplate: {
      subject: input.emailTemplate.subject,
      html: input.emailTemplate.html,
    },
  };

  const { res, error } = await safeFetch(
    `${API_URL}/users/admin/send-emails`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
    'sendAdminEmails'
  );

  if (!res) {
    return { ok: false, error: error || 'Failed to send emails.' };
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to send emails.');
    return { ok: false, error: msg };
  }

  // in case backend returns some data (ids, count, etc.)
  const json: any = await res.json().catch(() => null);
  return { ok: true, data: json };
}
