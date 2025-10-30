// components/HomeHero.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomeHero() {
  // Optional: tiny hover state for CTA micro-interaction
  const [hover, setHover] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Background shape */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,#C6E3FF_0%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-12 md:py-16 lg:px-6">
        {/* Left: copy */}
        <div>
       <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E3EE] bg-white/70 px-3 py-1 text-xs text-[#2F4B6A] backdrop-blur">
  ✅ Turn visitors into loyal customers automatically
</div>

<h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1C2E4A] sm:text-4xl lg:text-5xl">
  Capture via QR. <span className="text-[#3D6984]">Engage</span> with
  scheduled SMS, WhatsApp and email.
</h1>

<p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#546274]">
  Create a QR code in one click, collect contacts on the spot, then send
  personalised campaigns using your saved or custom templates. No
  copy-pasting. No chaos. Just results.
</p>


          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#packages"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-6 py-3 text-sm font-medium text-white shadow transition-[transform,opacity,filter] hover:brightness-105 hover:shadow-md active:scale-[0.98]"
            >
              Get Started
              <span
                className={`ml-1.5 transition-transform ${
                  hover ? "translate-x-0.5" : ""
                }`}
                aria-hidden
              >
                →
              </span>
            </Link>

            <Link
              href="#packages"
              className="inline-flex items-center justify-center rounded-full border border-[#CAD7E5] bg-white px-6 py-3 text-sm font-medium text-[#1C2E4A] hover:bg-[#F1F6FA]"
            >
              View Packages
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-6 flex items-center gap-4 text-xs text-[#6B7C8F]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Auto-scheduling
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3D6984]" />
              Templates & personalization
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Consumption Counter
            </span>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative">
          {/* subtle card w/ gradient ring */}
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] overflow-hidden rounded-3xl border border-[#E6EEF5] bg-white shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-[#EAF4FF]/50" />
            <Image
              src="/images/person-scanning-qr-code.jpg" // <- put your Freepik image here
              alt="Automated SMS & email from your phone"
              fill
              sizes="(max-width: 768px) 90vw, 560px"
              priority
              className="object-cover"
            />
          </div>

          {/* Floating envelopes (light motion without libs) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-6 -top-6 hidden h-24 w-24 animate-bob md:block"
          >
            <Envelope />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 top-12 hidden h-16 w-16 animate-bob-delayed md:block"
          >
            <Envelope />
          </div>
        </div>
      </div>
    </section>
  );
}

function Envelope() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <rect
        x="2"
        y="8"
        width="44"
        height="32"
        rx="6"
        className="fill-white"
        stroke="#3D6984"
        strokeWidth="2"
      />
      <path d="M4 12l20 14L44 12" fill="none" stroke="#3D6984" strokeWidth="2" />
    </svg>
  );
}

/* Tailwind keyframes (add in globals.css if you prefer)
   Here we use arbitrary values to avoid editing config.
*/
