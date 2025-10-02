"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 🚧 MOCK: later call real API POST /auth/register
    console.log("Registering:", form);

    // fake "logged in"
    document.cookie = `session=demo-user; path=/;`;

    router.replace("/billing");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 text-white">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          placeholder="Restaurant / Tenant Name"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <input
          placeholder="Phone"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-sm text-white/60">
        Already have an account?{" "}
        <a href="/login" className="underline">Login</a>
      </p>
    </main>
  );
}
