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




    {/* Contact Form Section */}
<section id="contact" className="mx-auto mt-24 ">
  <h2 className="text-4xl md:text-5xl font-extrabold text-[#1C2E4A] mb-8 ">
    Reach Out Anytime
  </h2>

  <div className="flex flex-col md:flex-row items-start gap-10">
    {/* Left: Icons and Contact */}


    {/* Right: Description Text */}
   <p className="text-lg md:text-xl text-[#546274]">
  Have any questions or need assistance?
  <br /><br />
  Whether you’re curious about our services, need help with an order, or would like advice on choosing the right solution, we’re here to help. Reach out to us anytime by email or phone, and our friendly team will respond promptly to ensure all your queries are answered.
  <br /><br />
  Your satisfaction is our priority, and we’re always ready to offer guidance, support, or any information you may need to make your experience smooth and enjoyable.
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

        {/* ✅ Add ID for FAQ */}
      <section id="faq" className="mt-20">
  <Faq
    items={[
      {
        q: "How does the platform work?",
        a: "When a client fills out your form, their information is automatically captured by the system. Based on your setup, the platform then sends scheduled messages via email, WhatsApp, or SMS either instantly or at a time you choose.",
      },
      {
        q: "Can I customize the messages sent to my clients?",
        a: "Yes! You can fully personalize the content, sender name, and schedule of each message. You can also create different message templates for different campaigns or forms.",
      },
      {
        q: "Does the platform support all countries and phone numbers?",
        a: "Yes, our system supports international numbers and can send WhatsApp, SMS, and email messages globally, depending on your chosen communication channel and plan.",
      },
      {
        q: "Is there a limit on how many messages I can send?",
        a: "Message limits depend on your plan. Higher tiers offer bulk sending capabilities, while smaller plans are ideal for limited campaigns or small businesses.",
      },
      {
        q: "Do I need technical skills to use the platform?",
        a: "Not at all. The platform is built for simplicity—anyone can create, schedule, and track messages through an intuitive dashboard, with no coding required.",
      },
    ]}
  />
</section>

        <div className="h-12" />
      </main>

      <SiteFooter />
    </>
  );
}
