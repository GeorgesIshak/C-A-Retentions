// app/(auth)/forgot/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { forgotPassword } from '@/lib/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white font-medium hover:opacity-95 transition disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Send OTP'}
    </button>
  );
}

export default function ForgotPage() {
  const sp = useSearchParams();
  const error = sp.get('error');
  const info = sp.get('info');
  const prefill = sp.get('email') || '';

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <form
        action={forgotPassword}
        className="w-full max-w-sm rounded-2xl bg-white/90 p-8 backdrop-blur-xl shadow-xl border border-white/10"
      >
        <h1 className="text-center text-[#1C2E4A] text-2xl font-semibold mb-6">
          Forgot Password
        </h1>

        {/* show backend messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </div>
        )}

        <label className="block">
          <span className="text-[#1C2E4A] text-sm font-semibold">Email</span>
          <input
            type="email"
            name="email"
            defaultValue={prefill}
            className="mt-1 w-full rounded-full border border-[#3D6984]/30 bg-white p-2.5 text-[#1C2E4A] text-[14px] placeholder-gray-400 outline-none focus:border-[#3D6984] focus:ring-2 focus:ring-[#3D6984]/50 transition"
            placeholder="Enter your account email"
            required
          />
        </label>

        <SubmitButton />

        <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
          Remembered your password?{' '}
          <a href="/login" className="underline hover:text-[#3D6984]">
            Back to sign in
          </a>
        </p>
      </form>
    </main>
  );
}
