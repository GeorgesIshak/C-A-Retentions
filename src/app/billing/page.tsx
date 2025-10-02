"use client";

import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();

  function handlePurchase() {
    // Fake purchase → set subscription cookie
    document.cookie = "subscription=active; Path=/; Max-Age=86400; SameSite=Lax";
    router.replace("/dashboard/contacts");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 text-white">
      <h1 className="text-2xl font-bold mb-6">Billing (Mock)</h1>
      <p className="mb-6">Here you would choose and pay for a package.</p>
      <button
        onClick={handlePurchase}
        className="w-full rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
      >
        Complete Purchase
      </button>
    </main>
  );
}
