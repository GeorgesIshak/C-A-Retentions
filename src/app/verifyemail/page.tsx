'use client';

import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { verifyEmail } from '@/lib/actions/auth';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white disabled:opacity-50"
    >
      {pending ? 'Verifying…' : 'Verify Email'}
    </button>
  );
}

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const email = sp.get('email') ?? '';
  const error = sp.get('error');

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form action={verifyEmail} className="w-full max-w-sm rounded-2xl bg-white/90 p-8 shadow-xl border border-white/10">
        <h1 className="text-2xl font-semibold mb-4 text-[#1C2E4A]">Verify your email</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-semibold text-[#1C2E4A]">Email</span>
          <input
            name="email"
            type="email"
            value={email}
            readOnly
            className="mt-1 w-full rounded-full border border-[#3D6984]/30 bg-gray-100 p-2.5 text-gray-600 cursor-not-allowed"
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm font-semibold text-[#1C2E4A]">OTP Code</span>
          <input
            name="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            className="mt-1 w-full text-center tracking-widest rounded-full border border-[#3D6984]/30 bg-white p-2.5"
            placeholder="123456"
          />
        </label>

        <SubmitBtn />

        <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
          Already verified? <a href="/login" className="underline hover:text-[#3D6984]">Sign in</a>
        </p>
      </form>
    </main>
  );
}
