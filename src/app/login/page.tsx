"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // 🚧 Mock login: sets a cookie
document.cookie = "session=demo-user; Path=/; Max-Age=86400; SameSite=Lax";

    // go to "next" if provided, otherwise /dashboard
    const next = sp.get("next") || "/dashboard/contacts";
    router.replace(next);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 text-black">
      <h1 className="text-2xl font-bold mb-6">Login (mock)</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          placeholder="Email"
          type="email"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          required
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 outline-none"
          required
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Login
        </button>
      </form>
    </main>
  );
}
