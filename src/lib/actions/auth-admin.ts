/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

type JWTPayload = {
  email?: string;
  exp?: number;
  isAdmin?: boolean;
  roles?: string[] | readonly string[];
};

// ------- helpers -------
function decodeJwtPayload<T = any>(jwt: string): T | undefined {
  try {
    const payload = jwt.split('.')[1] || '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(base64 + pad, 'base64').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

async function readErr(res: Response, fallback: string) {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body: any = await res.json().catch(() => ({}));
      const m = body?.message;
      return Array.isArray(m) ? m.join(', ') : (m || fallback);
    }
    const t = await res.text().catch(() => '');
    return t || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Returns true if token payload indicates admin.
 * - isAdmin === true
 * - or roles includes 'admin'
 */
function isAdminFromPayload(p?: JWTPayload | null) {
  if (!p) return false;
  if (p.isAdmin === true) return true;
  if (Array.isArray(p.roles) && p.roles.includes('admin')) return true;
  return false;
}

/**
 * If token lacks admin claim, optionally verify by calling /users/profile.
 * Your backend should return { isAdmin: boolean } there.
 */
async function fetchAdminFromProfile(token: string) {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const profile: any = await res.json().catch(() => ({}));
  return profile?.isAdmin === true || (Array.isArray(profile?.roles) && profile.roles.includes('admin'));
}

// ------- actions -------
export async function loginAdmin(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/admin-login?error=' + encodeURIComponent('Email and password are required.'));
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Login failed.');
    redirect('/admin-login?error=' + encodeURIComponent(msg));
  }

  let accessToken = '';
  let refreshToken = '';
  try {
    const json: any = await res.json();
    accessToken = String(json?.accessToken || '');
    refreshToken = String(json?.refreshToken || '');
  } catch {
    redirect('/admin-login?error=' + encodeURIComponent('Invalid response from server.'));
  }

  if (!accessToken || !refreshToken) {
    redirect('/admin-login?error=' + encodeURIComponent('Missing tokens in response.'));
  }

  // Decode token and validate expiry + admin claim
  const payload = decodeJwtPayload<JWTPayload>(accessToken) || {};
  const isExpired = typeof payload.exp === 'number' ? payload.exp * 1000 <= Date.now() : false;
  if (isExpired) {
    redirect('/admin-login?error=' + encodeURIComponent('Session token already expired. Please sign in again.'));
  }

  // Prefer the claim in the token
  let isAdmin = isAdminFromPayload(payload);

  // Fallback: if token didn't include claim, ask backend profile
  if (!isAdmin) {
    isAdmin = await fetchAdminFromProfile(accessToken);
  }

  if (!isAdmin) {
    redirect('/admin-login?error=' + encodeURIComponent('This account is not authorized as admin.'));
  }

  // Set cookies
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  jar.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  jar.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/admin/packages');
}

export async function logout() {
  const jar = await cookies();
  const access = jar.get('accessToken')?.value;

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      cache: 'no-store',
    });
  } catch {
    // ignore
  }

  jar.delete('accessToken');
  jar.delete('refreshToken');

  jar.set('flash', 'Signed out.', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60,
  });

  redirect('/admin-login');
}
