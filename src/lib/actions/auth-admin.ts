/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

/** Helper: Decode token and check isAdmin */
function isAdminFromToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = jwt.decode(token) as any;
    return Boolean(decoded?.isAdmin === true);
  } catch {
    return false;
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
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/admin');

  if (!email || !password) {
    redirect('/admin-login?error=' + encodeURIComponent('Email and password are required.'));
  }

  const jar = await cookies();
  const existingToken = jar.get('accessToken')?.value ?? null;

  // ✅ If user already logged in, verify admin access
  if (existingToken) {
    if (isAdminFromToken(existingToken)) {
      redirect(next || '/admin');
    } else {
      redirect('/admin-login?error=' + encodeURIComponent('You are not an admin.'));
    }
  }

  // ---- New login request
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch (err) {
    // 🛑 Network / backend down
    redirect(
      '/admin-login?error=' +
        encodeURIComponent('Cannot reach server. Please check your connection and try again.')
    );
  }

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

  // ✅ Check token payload for admin privileges
  if (!isAdminFromToken(accessToken)) {
    redirect('/admin-login?error=' + encodeURIComponent('You are not an admin.'));
  }

  // Save tokens if verified admin
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

  redirect(next || '/admin');
}

/** LOGOUT → clear cookies and set a one-time flash message */
export async function logout() {
  const jar = await cookies();
  const access = jar.get('accessToken')?.value;

  // (Optional) revoke on backend
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
    // if backend is down, we just clear cookies locally anyway
  }

  // clear session cookies
  jar.delete('accessToken');
  jar.delete('refreshToken');

  // set a short-lived flash cookie (server-only)
  jar.set('flash', 'Signed out.', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60, // 1 minute
  });
}
