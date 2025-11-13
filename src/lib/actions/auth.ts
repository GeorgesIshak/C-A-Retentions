/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
export type ChangePwState = { ok: boolean; message?: string | null };

import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  changePasswordFormSchema,
} from '@/lib/schema';

// Lazy accessor so we don't throw at module import time
function requireApiUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new Error('BACKEND_API_URL is not defined');
  return url;
}

/** Normalize backend error bodies/text */
async function readErr(res: Response, fallback: string) {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body: any = await res.json();
      const m = body?.message;
      return Array.isArray(m) ? m.join(', ') : (m || fallback);
    }
    const t = await res.text();
    return t || fallback;
  } catch {
    return fallback;
  }
}

/** LOGIN */
export async function login(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  const nextUrl = String(formData.get('next') ?? '');

  if (!parsed.success) {
    const qs = new URLSearchParams();
    qs.set('error', 'Validation failed. Please check your credentials.');
    if (nextUrl) qs.set('next', nextUrl);
    redirect(`/login?${qs.toString()}`);
  }

  const { email, password } = parsed.data;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch (err) {
    const qs = new URLSearchParams();
    qs.set('error', 'Cannot reach server. Please try again later.');
    if (nextUrl) qs.set('next', nextUrl);
    redirect(`/login?${qs.toString()}`);
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Login failed. Please check your credentials.');
    const qs = new URLSearchParams();
    qs.set('error', msg);
    if (nextUrl) qs.set('next', nextUrl);
    redirect(`/login?${qs.toString()}`);
  }

  const { accessToken, refreshToken } = await res.json();

  const jar = await cookies();
  jar.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
  jar.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Hard gate: if the user clicked a plan before login, honor it; else go to dashboard
  if (nextUrl) redirect(nextUrl);
  redirect('/dashboard');
}

/** SIGNUP → redirect to /verifyemail with the user's email */
export async function signup(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const first =
      parsed.error.issues?.[0]?.message ||
      parsed.error.flatten().formErrors?.[0] ||
      'Validation failed. Please check your inputs.';
    redirect('/register?error=' + encodeURIComponent(first));
  }

  const { email, password, fullName, phoneNumber } = parsed.data;

  const payload: Record<string, unknown> = { email, password };
  if (fullName !== undefined) payload.fullName = fullName ?? null;
  if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber ?? null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = 'Cannot reach server. Please try again later.';
    redirect('/register?error=' + encodeURIComponent(msg));
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Signup failed. Please try again.');
    redirect('/register?error=' + encodeURIComponent(msg));
  }

  redirect(`/verifyemail?email=${encodeURIComponent(email)}`);
}

/** VERIFY EMAIL → set cookies → dashboard */
export async function verifyEmail(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const email = (formData.get('email') as string) || '';
    redirect(
      `/verifyemail?email=${encodeURIComponent(email)}&error=${encodeURIComponent(
        'Invalid input. Check email and OTP.',
      )}`,
    );
  }
  const { email, otp } = parsed.data;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
      cache: 'no-store',
    });
  } catch (err) {
    redirect(
      `/verifyemail?email=${encodeURIComponent(email)}&error=${encodeURIComponent(
        'Cannot reach server. Please try again later.',
      )}`,
    );
  }

  if (!res.ok) {
    const msg = await readErr(res, 'OTP invalid or expired');
    redirect(`/verifyemail?email=${encodeURIComponent(email)}&error=${encodeURIComponent(msg)}`);
  }

  const { accessToken, refreshToken } = await res.json();

  const jar = await cookies();
  jar.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
  jar.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard/');
}

/** FORGOT PASSWORD → send OTP → redirect to /reset with email */
export async function forgotPassword(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect('/forgot?error=' + encodeURIComponent('Invalid email.'));
  }
  const { email } = parsed.data;

  let res: Response;
  try {
    // If your backend route is /auth/forgot-Password (different casing), adjust here.
    res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });
  } catch (err) {
    redirect(
      '/forgot?error=' +
        encodeURIComponent('Cannot reach server. Please try again later.'),
    );
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Failed to send OTP.');
    redirect('/forgot?error=' + encodeURIComponent(msg));
  }

  redirect(
    `/reset?email=${encodeURIComponent(email)}&info=${encodeURIComponent(
      'If that email exists, we sent an OTP.',
    )}`,
  );
}

/** RESEND OTP on the reset page */
export async function resendOtp(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = resendOtpSchema.safeParse(Object.fromEntries(formData.entries()));
  const email = (formData.get('email') as string) || '';
  if (!parsed.success) {
    redirect(
      `/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Invalid email.')}`,
    );
  }

  let res: Response;
  try {
    // If your backend route is /auth/ResendOtp, adjust here.
    res = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });
  } catch (err) {
    redirect(
      `/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(
        'Cannot reach server. Please try again later.',
      )}`,
    );
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Couldn’t resend OTP.');
    redirect(
      `/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(msg)}`,
    );
  }

  redirect(
    `/reset?email=${encodeURIComponent(email)}&info=${encodeURIComponent(
      'OTP re-sent. Check inbox/spam.',
    )}`,
  );
}

/** RESET PASSWORD → email + 6-digit otp + newPassword */
export async function resetPassword(formData: FormData) {
  const API_URL = requireApiUrl();

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  const fallbackEmail = (formData.get('email') as string) || '';
  if (!parsed.success) {
    redirect(
      `/reset?email=${encodeURIComponent(fallbackEmail)}&error=${encodeURIComponent(
        'Please check your inputs.',
      )}`,
    );
  }
  const { email, otp, newPassword } = parsed.data;

  let res: Response;
  try {
    // If your backend route is /auth/reset-Password (different casing), adjust here.
    res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
      cache: 'no-store',
    });
  } catch (err) {
    redirect(
      `/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(
        'Cannot reach server. Please try again later.',
      )}`,
    );
  }

  if (!res.ok) {
    const msg = await readErr(res, 'Invalid email or OTP.');
    redirect(`/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(msg)}`);
  }

  redirect('/login?success=' + encodeURIComponent('Password updated. You can sign in now.'));
}

/** LOGOUT → clear cookies and set a one-time flash message */
export async function logout() {
  const API_URL = requireApiUrl();

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
    // ignore network error on logout; we still clear cookies
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

  redirect('/login');
}

/** Decode accessToken cookie to get user ID */
export async function getCurrentUserFromToken(): Promise<{ id: string } | null> {
  const jar = await cookies();
  const token = jar.get('accessToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as {
      id?: string;
      sub?: string;
      userId?: string;
      uid?: string;
    } | null;

    if (!decoded) return null;

    // handle all common key names
    const id = decoded.id || decoded.sub || decoded.userId || decoded.uid;
    return id ? { id } : null;
  } catch (err) {
    console.error('JWT decode error:', err);
    return null;
  }
}

// --- tiny helpers ---
export async function getAccessToken() {
  return (await cookies()).get('accessToken')?.value ?? null;
}
export async function getRefreshToken() {
  return (await cookies()).get('refreshToken')?.value ?? null;
}
export async function setAccessToken(token: string | null) {
  const jar = await cookies();
  if (!token) jar.delete('accessToken');
  else
    jar.set('accessToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true in production under HTTPS
      path: '/',
    });
}
export async function setRefreshToken(token: string | null) {
  const jar = await cookies();
  if (!token) jar.delete('refreshToken');
  else
    jar.set('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true in production under HTTPS
      path: '/',
    });
}

/**
 * Calls your backend POST /auth/refresh-token with the refreshToken from cookie.
 * Expects body like: { accessToken: string, refreshToken?: string }
 * Returns the new access token (or null if refresh failed).
 */
export async function refreshAccessToken(): Promise<string | null> {
  const API_URL = requireApiUrl();

  const rt = await getRefreshToken();
  if (!rt) return null;

  try {
    const r = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // your backend expects the token in JSON body
      body: JSON.stringify({ refreshToken: rt }),
      cache: 'no-store',
    });

    if (!r.ok) return null;

    const data = (await r.json()) as { accessToken?: string; refreshToken?: string };

    if (data.accessToken) await setAccessToken(data.accessToken);
    if (data.refreshToken) await setRefreshToken(data.refreshToken); // if the backend rotates it

    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * fetchWithAuth — adds Authorization automatically and retries once on 401 by calling refreshAccessToken().
 * Use this from server actions and Next API routes when calling your backend.
 */
export async function fetchWithAuth(input: string, init: RequestInit = {}) {
  // 1) try with current access token
  const t1 = await getAccessToken();
  let res = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(t1 ? { Authorization: `Bearer ${t1}` } : {}),
    },
    cache: init.cache ?? 'no-store',
  });

  // 2) if expired, refresh once then retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res; // still 401 — caller decides (usually redirect to /login)

    res = await fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
      cache: init.cache ?? 'no-store',
    });
  }

  return res;
}

export async function changePasswordAction(
  _prev: ChangePwState,
  formData: FormData,
): Promise<ChangePwState> {
  const API_URL = requireApiUrl();

  const parsed = changePasswordFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const first =
      parsed.error.issues?.[0]?.message ||
      parsed.error.flatten().formErrors?.[0] ||
      'Please check your inputs.';
    return { ok: false, message: first };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const res = await fetchWithAuth(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      let msg = 'Failed to change password.';
      try {
        const j = await res.json();
        msg = j?.message || j?.error || msg;
      } catch {
        const t = await res.text().catch(() => '');
        if (t) msg = t;
      }
      return { ok: false, message: msg };
    }

    return { ok: true, message: 'Password updated successfully.' };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Unexpected error.' };
  }
}
