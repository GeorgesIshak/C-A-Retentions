"use client";

export default function LoginPage() {
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // no-op for now — backend will handle real login later
    alert("Login disabled until backend is ready.");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 text-black">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
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
