// src/app/guest-form/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // avoids prerender errors

export default function GuestFormPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <GuestFormInner />
    </Suspense>
  );
}

function GuestFormInner() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("t") ?? "", [sp]);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 👉 no API — just mark as "submitted"
    setDone(true);
  }

  if (done) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow text-center">
          <h2 className="text-lg font-bold">Thanks! ✅</h2>
          <p className="mt-2 text-sm text-gray-600">
            You’ve been added (locally only).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="max-w-md w-full rounded-2xl bg-white p-6 shadow space-y-4"
      >
        <h1 className="text-xl font-bold">Personal Information</h1>

        <input
          required
          placeholder="Enter username"
          className="w-full rounded-lg border px-3 py-2"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          required
          type="email"
          placeholder="Enter email"
          className="w-full rounded-lg border px-3 py-2"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <input
          required
          placeholder="Enter phone number"
          className="w-full rounded-lg border px-3 py-2"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white"
        >
          Submit
        </button>

        {/* optional debug: show token */}
        {token && (
          <p className="text-[11px] text-gray-400 text-center">
            Token: {token}
          </p>
        )}
      </form>
    </main>
  );
}
