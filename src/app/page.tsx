import PackageGrid from "@/components/packages/PackageGrid";
import { listPackages } from "@/lib/actions/admin-packages";
import { hasActivePlan } from "@/lib/actions/subscription";
import type { Package } from "@/types/packagePlan";
import { cookies } from "next/headers";
import HomeHero from "@/components/HomeHero";
import Faq from "@/components/Faq";
import HowItWorks from "@/components/HowItWorks";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { Mail, Phone } from "lucide-react";

export default async function Page() {
  const packages: Package[] = await listPackages({ active: true, limit: 100 });
  const authed = Boolean((await cookies()).get("accessToken")?.value);
  const userHasActivePlan = authed ? await hasActivePlan() : false;

  return (
    <>
      <Header />
      <HomeHero />

      {/* ✅ Add ID for How It Works */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      <main className="mx-auto max-w-7xl px-4 md:px-6 text-[#0F1F33]">
        {/* ✅ Add ID for Packages (pricing) */}
        <section id="packages" className="mt-14 md:mt-16">
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

        {/* ✅ Add ID for FAQ */}
        <section id="faq" className="mt-20">
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
        </section>

    {/* Contact Form Section */}
<section id="contact" className="mx-auto mt-24 ">
  <h2 className="text-4xl md:text-5xl font-extrabold text-[#1C2E4A] mb-8 ">
    Reach Out Anytime
  </h2>

  <div className="flex flex-col md:flex-row items-start gap-10">
    {/* Left: Icons and Contact */}


    {/* Right: Description Text */}
    <p className=" text-lg md:text-xl text-[#546274]">
      Have any questions or need assistance? <br/><br/>  Whether you’re curious about our services, need help with an order, or want advice on choosing the right solution, we’re here to help. Reach out to us anytime via email or phone, and our friendly team will respond promptly to ensure all your questions are answered. <br></br>Your satisfaction is our priority, and we’re always ready to provide guidance, support, or any information you need to make your experience smooth and enjoyable.
    </p>
        <div className="flex flex-col gap-6 ">
      <a
        href="mailto:contact@yourcompany.com"
        className="flex items-center gap-4 bg-[#F1F5F9] hover:bg-[#E6EEF5] transition rounded-2xl px-6 py-4 shadow-md text-lg md:text-xl font-medium"
      >
        <Mail className="text-[#3D6984]" size={28} />
        contact@yourcompany.com
      </a>

      <a
        href="tel:+966555123456"
        className="flex items-center gap-4 bg-[#F1F5F9] hover:bg-[#E6EEF5] transition rounded-2xl px-6 py-4 shadow-md text-lg md:text-xl font-medium"
      >
        <Phone className="text-[#3D6984]" size={28} />
        +966 555 123 456
      </a>
    </div>
  </div>
</section>



        <div className="h-12" />
      </main>

      <SiteFooter />
    </>
  );
}
