/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";


import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
} from '@/lib/schema';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

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
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect('/login?error=' + encodeURIComponent('Validation failed. Please check your credentials.'));
  }
  const { email, password } = parsed.data;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Login failed. Please check your credentials.');
    redirect('/login?error=' + encodeURIComponent(msg));
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

/** SIGNUP → redirect to /verifyemail with the user's email */
export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect('/register?error=' + encodeURIComponent('Validation failed. Please check your inputs.'));
  }
  const { email, password } = parsed.data;

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Signup failed. Please try again.');
    redirect('/register?error=' + encodeURIComponent(msg));
  }

  // success → go to /verifyemail with the email prefilled
  redirect(`/verifyemail?email=${encodeURIComponent(email)}`);
}

/** VERIFY EMAIL → set cookies → dashboard */
export async function verifyEmail(formData: FormData) {
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

  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
    cache: 'no-store',
  });

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
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect('/forgot?error=' + encodeURIComponent('Invalid email.'));
  }
  const { email } = parsed.data;

  // If your backend route is /auth/forgot-Password (different casing), adjust here.
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });

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
  const parsed = resendOtpSchema.safeParse(Object.fromEntries(formData.entries()));
  const email = (formData.get('email') as string) || '';
  if (!parsed.success) {
    redirect(`/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent('Invalid email.')}`);
  }

  // If your backend route is /auth/ResendOtp, adjust here.
  const res = await fetch(`${API_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Couldn’t resend OTP.');
    redirect(`/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/reset?email=${encodeURIComponent(email)}&info=${encodeURIComponent('OTP re-sent. Check inbox/spam.')}`);
}

/** RESET PASSWORD → email + 6-digit otp + newPassword */
export async function resetPassword(formData: FormData) {
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

  // If your backend route is /auth/reset-Password (different casing), adjust here.
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await readErr(res, 'Invalid email or OTP.');
    redirect(`/reset?email=${encodeURIComponent(email)}&error=${encodeURIComponent(msg)}`);
  }

  redirect('/login?success=' + encodeURIComponent('Password updated. You can sign in now.'));
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
  } catch {}

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

  // no query string
  redirect('/login');
}
/** Decode accessToken cookie to get user ID */
export async function getCurrentUserFromToken(): Promise<{ id: string } | null> {
  const jar = await cookies();
  const token = jar.get("accessToken")?.value;
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
    console.error("JWT decode error:", err);
    return null;
  }
}

