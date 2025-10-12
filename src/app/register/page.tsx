// app/(auth)/register/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { signup } from '@/lib/actions/auth';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-6 w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white">
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  );
}

export default function RegisterPage() {
  const sp = useSearchParams();
  const error = sp.get('error');

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form action={signup} className="w-full max-w-sm rounded-2xl bg-white/90 p-8">
        <h1 className="text-2xl font-semibold mb-6 text-[#1C2E4A]">Create account</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-semibold text-[#1C2E4A]">Email</span>
          <input name="email" type="email" required className="mt-1 w-full rounded-full border border-[#3D6984]/30 p-2.5" />
        </label>

        <label className="block mb-2">
          <span className="text-sm font-semibold text-[#1C2E4A]">Password</span>
          <input name="password" type="password" required className="mt-1 w-full rounded-full border border-[#3D6984]/30 p-2.5" />
          <p className="mt-1 text-xs text-[#1C2E4A]/70">Min 8 chars, include upper, lower, number & symbol.</p>
        </label>

        <Submit />

        <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
          Already have an account? <a href="/login" className="underline">Sign in</a>
        </p>
      </form>
    </main>
  );
}
