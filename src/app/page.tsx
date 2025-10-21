// app/page.tsx
import SiteHeader from "@/components/SiteHeader";
import PackageGrid from "@/components/packages/PackageGrid";
import { listPackages } from "@/lib/actions/admin-packages";
import { hasActivePlan } from "@/lib/actions/subscription";
import type { Package } from "@/types/packagePlan";
import { cookies } from "next/headers";
import HomeHero from "@/components/HomeHero";
import Faq from "@/components/Faq";
import HowItWorks from "@/components/HowItWorks";

export default async function Page() {
  const packages: Package[] = await listPackages({ active: true, limit: 100 });
  const authed = Boolean((await cookies()).get("accessToken")?.value);
  const userHasActivePlan = authed ? await hasActivePlan() : false;

  return (
    <>
      <SiteHeader />
      <HomeHero />
      <HowItWorks />

      <main className="mx-auto max-w-7xl px-4 md:px-6 text-[#0F1F33]">
        {/* Pricing */}
        <section id="pricing" className="mt-14 md:mt-16">
          <h2 className="mb-2 text-2xl font-bold text-[#1C2E4A] md:text-3xl">
            Choose your plan
          </h2>
          <p className="mb-6 max-w-3xl text-[#5B6B7C]">
            Simple, transparent pricing. No hidden fees. Upgrade or cancel anytime.
          </p>

          <PackageGrid
            packages={packages}
            authed={authed}
            userHasActivePlan={userHasActivePlan}
          />
        </section>

        {/* FAQ with nice spacing + smooth opening */}
        <Faq
          items={[
            {
              q: "Can I test SMS without a dedicated number?",
              a: "In live environments you need a verified sender (or purchased number). In sandbox, you can send to verified recipient numbers.",
            },
            {
              q: "Do you have APIs and webhooks?",
              a: "Yes. Import contacts, trigger campaigns, and fetch analytics via REST with signed webhooks.",
            },
            {
              q: "Is my data secure?",
              a: "Data is encrypted in transit and at rest. Role-based access and audit logs are available.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Absolutely. Plans downgrade at the end of the billing period with no hidden fees.",
            },
          ]}
        />
        <section className="mx-auto mt-20 max-w-4xl rounded-3xl border border-[#E6EEF5] bg-white/60 backdrop-blur-sm px-8 py-14 text-center shadow-sm">
  <h4 className="text-2xl md:text-3xl font-bold text-[#1C2E4A]">
    Turn every QR scan into a customer — automatically.
  </h4>

  <p className="mt-3 text-[#546274] max-w-xl mx-auto">
    Capture leads, send SMS & email flows, and boost retention with zero manual work.
  </p>

  <div className="mt-6 flex justify-center">
    <a
      href="#pricing"
      className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-6 py-3 text-white font-medium hover:opacity-95 transition"
    >
      Get Started Now
    </a>
  </div>
</section>


        <div className="h-12" />
      </main>
    </>
  );
}
