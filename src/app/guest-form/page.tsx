// src/app/guest-form/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/v1"; // your backend

export default function GuestFormPage() {
  const sp = useSearchParams();
  const tenantId = sp.get("t") || ""; // using raw ID for now

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) {
      setErrMsg("Invalid link.");
      return;
    }
    setSubmitting(true);
    setErrMsg(null);
    try {
      const res = await fetch(`${API_BASE}/public/contacts?t=${encodeURIComponent(tenantId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send required fields; backend will map `t` → tenant
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          consent: true,             // if you have a checkbox, send that too
          source: "qr_guest_form",   // optional metadata
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to submit");
      }
      setDone(true);
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold">Thanks! ✅</h2>
          <p className="mt-2 text-sm text-gray-600">You’ve been added.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="max-w-md w-full rounded-2xl bg-white p-6 shadow space-y-4">
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

        {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
}
