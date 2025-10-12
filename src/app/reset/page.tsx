// app/reset/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { resetPassword, resendOtp } from '@/lib/actions/auth';

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white font-medium hover:opacity-95 transition disabled:opacity-50"
    >
      {pending ? 'Resetting...' : 'Reset Password'}
    </button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      formAction={resendOtp}   // submits same form values (email)
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1 underline text-sm text-[#1C2E4A]/70 hover:text-[#3D6984] disabled:opacity-50"
    >
      {pending ? 'Resending...' : 'Resend OTP'}
    </button>
  );
}

export default function ResetPage() {
  const sp = useSearchParams();
  const error = sp.get('error');
  const info = sp.get('info');
  const email = sp.get('email') || '';

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <form
          action={resetPassword}
          className="rounded-2xl bg-white p-8 shadow-xl border border-[#E6EEF5]"
        >
          <div className="mb-6 text-center">
            <h1 className="text-[#1C2E4A] text-2xl font-semibold">Reset your password</h1>
            <p className="mt-1 text-sm text-[#6B7C8F]">
              Enter the 6-digit code sent to your email and choose a new password.
            </p>
          </div>

          {info && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {info}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <label className="block">
              <span className="text-[#1C2E4A] text-sm font-semibold">Email</span>
              <input
                type="email"
                name="email"
                defaultValue={email}
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-[#CAD7E5] bg-white px-3 py-2.5 text-[#1C2E4A] text-[14px] placeholder-gray-400 outline-none focus:border-[#3D6984] focus:ring-2 focus:ring-[#3D6984]/30 transition"
                placeholder="you@example.com"
                required
              />
              <div className="mt-1 text-xs text-[#6B7C8F]">
                Not your email?{' '}
                <a
                  href={`/forgot${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="underline hover:text-[#3D6984]"
                >
                  Use a different one
                </a>
                .
              </div>
            </label>

            <label className="block">
              <span className="text-[#1C2E4A] text-sm font-semibold">OTP code</span>
              <input
                type="text"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                className="mt-1 w-full rounded-xl border border-[#CAD7E5] bg-white px-3 py-2.5 text-[#1C2E4A] text-[16px] tracking-[0.4em] placeholder-gray-400 outline-none focus:border-[#3D6984] focus:ring-2 focus:ring-[#3D6984]/30 transition"
                placeholder="• • • • • •"
                required
              />
            </label>

            <label className="block">
              <span className="text-[#1C2E4A] text-sm font-semibold">New password</span>
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-[#CAD7E5] bg-white px-3 py-2.5 text-[#1C2E4A] text-[14px] placeholder-gray-400 outline-none focus:border-[#3D6984] focus:ring-2 focus:ring-[#3D6984]/30 transition"
                placeholder="Create a strong password"
                required
              />
            </label>
          </div>

          <ResetButton />

          <div className="mt-6 flex items-center justify-between text-sm">
            <a href="/login" className="underline text-[#1C2E4A]/70 hover:text-[#3D6984]">
              Back to sign in
            </a>
            <div className="text-right">
              <span className="mr-2 text-[#6B7C8F]">Didn’t get the code?</span>
              <ResendButton />
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
