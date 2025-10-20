// app/page.tsx
import SiteHeader from "@/components/SiteHeader";
import PackageGrid from "@/components/packages/PackageGrid";
import { listPackages } from "@/lib/actions/admin-packages";
import { hasActivePlan } from "@/lib/actions/subscription";
import type { Package } from "@/types/packagePlan";
import { cookies } from "next/headers";

export default async function Page() {
  const packages: Package[] = await listPackages({ active: true, limit: 100 });
  const authed = Boolean((await cookies()).get("accessToken")?.value);
  const userHasActivePlan = authed ? await hasActivePlan() : false;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 md:px-6 text-[#0F1F33]">
        {/* ===== Everything you need ===== */}
        <section id="features" className="pt-10 md:pt-12">
          <h1 className="text-2xl font-bold text-[#1C2E4A] md:text-3xl">
            Everything you need
          </h1>
          <p className="mt-1 text-[#546274]">
            Clear, focused features that ship outcomes—not busywork.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard title="SMS Campaigns" desc="Send at scale, track clicks, and auto-reply. Two-way messaging included." icon="💬" />
            <FeatureCard title="Email Campaigns" desc="Drag-and-drop templates, A/B tests, and deliverability insights." icon="📧" />
            <FeatureCard title="Segments & Tags" desc="Group contacts by behavior, purchases, or custom rules." icon="🏷️" />
            <FeatureCard title="Templates" desc="Reusable content blocks with variables for personalization." icon="🧩" />
            <FeatureCard title="Scheduling" desc="Send now, later, or on cadence. Safe throttling built-in." icon="⏱️" />
            <FeatureCard title="Analytics" desc="Opens, clicks, replies, and revenue—clearly reported." icon="📊" />
          </div>
        </section>

        {/* ===== Packages / Pricing ===== */}
        <section id="pricing" className="mt-14 md:mt-16">
          <h2 className="mb-2 text-2xl font-bold text-[#1C2E4A] md:text-3xl">Choose your plan</h2>
          <p className="mb-6 max-w-3xl text-[#5B6B7C]">
            Simple, transparent pricing. No hidden fees. Upgrade or cancel anytime.
          </p>

          <PackageGrid
            packages={packages}
            authed={authed}
            userHasActivePlan={userHasActivePlan}
          />
        </section>

        {/* ===== FAQ (dropdown / accordion) ===== */}
        <section className="mt-14 md:mt-16">
          <h2 className="text-2xl font-bold text-[#1C2E4A]">FAQs</h2>
          <p className="mt-1 text-[#546274]">Quick answers to common questions.</p>

          <div className="mt-6 divide-y divide-[#E6EEF5] rounded-2xl border border-[#E6EEF5] bg-white">
            <Accordion q="Can I test SMS without a dedicated number?">
              In live environments you need a verified sender (or purchased number). In sandbox, you can send to verified recipient numbers.
            </Accordion>
            <Accordion q="Do you have APIs and webhooks?">
              Yes. Import contacts, trigger campaigns, and fetch analytics via REST with signed webhooks.
            </Accordion>
            <Accordion q="Is my data secure?">
              Data is encrypted in transit and at rest. Role-based access and audit logs are available.
            </Accordion>
            <Accordion q="Can I cancel anytime?">
              Absolutely. Plans downgrade at the end of the billing period with no hidden fees.
            </Accordion>
          </div>
        </section>

        <div className="h-12" />
      </main>
    </>
  );
}

/* ---------- Local UI bits (no gradients) ---------- */

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#E6EEF5] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F8FC] text-2xl">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[#1C2E4A]">{title}</h3>
          <p className="mt-1 text-[#546274]">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Accordion({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  // Accessible, no JS needed—native <details> with custom styles
  return (
    <details className="group open:bg-[#F9FBFE]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-left text-[15px] font-medium text-[#0F1F33]">
        <span>{q}</span>
        <span
          className="ml-4 select-none rounded-full border border-[#D6E3EE] px-2 py-0.5 text-xs text-[#3D6984] transition group-open:rotate-45"
          aria-hidden
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-5 text-[#546274]">{children}</div>
    </details>
  );
}
