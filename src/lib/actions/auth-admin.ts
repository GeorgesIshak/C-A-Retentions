/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL = process.env.BACKEND_API_URL!;
const OWNER_EMAIL = (process.env.OWNER_EMAIL || '').toLowerCase();

if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

type JWTPayload = { email?: string; exp?: number };

// Robust base64url decode (Node/server action is fine with Buffer, but normalize first)
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

  // Be defensive parsing success payloads too
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

  const payload = decodeJwtPayload<JWTPayload>(accessToken) || {};
  const tokenEmail = String(payload.email || '').toLowerCase();
  const isExpired = typeof payload.exp === 'number' ? payload.exp * 1000 <= Date.now() : false;

  if (isExpired) {
    redirect('/admin-login?error=' + encodeURIComponent('Session token already expired. Please sign in again.'));
  }

  if (tokenEmail !== OWNER_EMAIL) {
    redirect('/admin-login?error=' + encodeURIComponent('This account is not the admin.'));
  }

  const jar = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  // Session cookies
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

  // Go directly to the real page
  redirect('/admin/packages');
}

export async function logout() {
  const jar = await cookies();
  const access = jar.get('accessToken')?.value;

  // Best-effort revoke
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
    // ignore network errors on logout
  }

  // Clear cookies
  jar.delete('accessToken');
  jar.delete('refreshToken');

  // Optional flash (server-only)
  jar.set('flash', 'Signed out.', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60,
  });

  redirect('/admin-login');
}
