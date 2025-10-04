// src/app/guest-form/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function GuestFormPage() {
  const sp = useSearchParams();
  const token = sp.get("t") ?? "";

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // no API — just mark as submitted
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
          {token && (
            <p className="mt-3 text-[11px] text-gray-400">Token: {token}</p>
          )}
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
          autoComplete="name"
        />
        <input
          required
          type="email"
          placeholder="Enter email"
          className="w-full rounded-lg border px-3 py-2"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
        <input
          required
          type="tel"
          placeholder="Enter phone number"
          className="w-full rounded-lg border px-3 py-2"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />

        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white"
        >
          Submit
        </button>

        {token && (
          <p className="text-[11px] text-gray-400 text-center">Token: {token}</p>
        )}
      </form>
    </main>
  );
}
