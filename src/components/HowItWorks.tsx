"use client";

import React, { useEffect, useRef, forwardRef } from "react";
import {
  QrCode,
  UsersRound,
  Send,
  CalendarClock,
  MessageSquare,
  Mail,
  ChevronRight,
} from "lucide-react";

/* -------------------- fade-in on reveal (with stagger) -------------------- */
function useReveal(delayMs = 0) {
  const ref = useRef<HTMLDivElement | null>(null);
  const delayRef = useRef(delayMs);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // use the stable ref value
    el.style.transitionDelay = `${delayRef.current}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.remove("opacity-0", "translate-y-6");
            el.classList.add("opacity-100", "translate-y-0");
            io.disconnect();
          }
        });
      },
      { threshold: 0.14 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []); // <- stays constant

  return ref;
}


/* -------------------- main section -------------------- */
export default function HowItWorks() {
  // stagger 0 / 80 / 160ms
  const r1 = useReveal(0);
  const r2 = useReveal(80);
  const r3 = useReveal(160);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-18">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C2E4A]">
          How it works
        </h2>
      </div>
      <p className="mt-2 max-w-2xl text-[#546274]">
        From scan to scheduled outreach in seconds. No copy-pasting. No chaos.
      </p>

      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Step 1 */}
        <Card ref={r1}>
          <Header
            icon={<QrCode className="h-6 w-6" />}
            title="Create a QR in One Click"    
            step="Step 1"
          />
          <p className="mt-2 text-sm text-[#5B6B7C]">
            Generate a  QR and place it anywhere. Visitors scan and land
            on your frictionless form.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#22384F]">
          
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6984]" />
              Auto-hosted form page
            </li>
          </ul>
        </Card>

        {/* Step 2 */}
        <Card ref={r2}>
          <Header
            icon={<UsersRound className="h-6 w-6" />}
            title="Capture Contacts Instantly"
            step="Step 2"
          />
          <p className="mt-2 text-sm text-[#5B6B7C]">
            Every scan becomes a contact — email and/or phone — neatly organized
            with tags and consent.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill icon={<MessageSquare className="h-3.5 w-3.5" />}>SMS-ready</Pill>
            <Pill icon={<Mail className="h-3.5 w-3.5" />}>Email-ready</Pill>
          </div>
        </Card>

        {/* Step 3 */}
        <Card ref={r3}>
          <Header
            icon={<Send className="h-6 w-6" />}
            title="Schedule & Send Automatically"
            step="Step 3"
          />
          <p className="mt-2 text-sm text-[#5B6B7C]">
            Choose a saved template or write a custom one. Send now or schedule
            for later — SMS or email.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E6EEF5] bg-[#F7FAFD] px-3 py-2 text-xs text-[#22384F]">
            <CalendarClock className="h-4 w-4" />
            Auto-scheduling with safe throttling
          </div>
          <a
            href="#pricing"
            className="group/link mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#1C2E4A] transition-colors hover:text-[#3D6984]"
          >
            See plans
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </a>
        </Card>
      </div>
    </section>
  );
}

/* -------------------- small presentational pieces -------------------- */

const Card = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        className="group relative rounded-2xl border border-[#E6EEF5] bg-white p-6 shadow-sm transition
                   hover:shadow-lg hover:-translate-y-1 hover:border-[#DDE7F1]
                   opacity-0 translate-y-6 duration-700 ease-out"
      >
        {/* subtle edge glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_0_0_rgba(61,105,132,0)] transition group-hover:shadow-[0_0_0_5px_rgba(61,105,132,0.08)]" />
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

function Header({
  icon,
  title,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  step: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl
                   bg-[#E9F2FA] text-[#1C2E4A] shadow-inner
                   ring-1 ring-inset ring-white/40"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7C8F]">
          {step}
        </div>
        <h4 className="mt-0.5 text-[16px] font-semibold text-[#0F1F33]">
          {title}
        </h4>
      </div>
    </div>
  );
}

function Pill({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#E6EEF5] bg-white px-2.5 py-1 text-[#22384F]">
      {icon}
      {children}
    </span>
  );
}
