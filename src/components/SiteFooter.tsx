import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#1C2E4A] border-t border-[#BDC4D4] mt-10">
      {/* Top: Logo + tagline */}
      <div className="max-w-7xl mx-auto px-[10px] py-10 flex flex-col items-center text-center gap-6">
        <Link
          href="/"
          aria-label="C&A Retentions Home"
          className="relative block w-[220px] h-[54px]"
        >
          <Image
            src="/images/logo.svg"
            alt="C&A Retentions"
            fill
            priority
            style={{ objectFit: "contain" }}
          />
        </Link>

        <p className="max-w-2xl text-sm leading-relaxed text-[#334155]">
          C&amp;A Retentions helps your business capture, nurture, and retain
          customers with streamlined tools for packages, messaging, and analytics—
          without the busywork. Built to be fast, clear, and effective.
        </p>
      </div>

      {/* Middle: Menu + Social */}
      <div className="max-w-7xl mx-auto px-[10px] py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Menu */}
        <ul className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm uppercase tracking-wide">
          <li>
            <Link href="/#how-it-works" className="hover:opacity-80 transition">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/#packages" className="hover:opacity-80 transition">
              Packages
            </Link>
          </li>
          <li>
            <Link href="/#faq" className="hover:opacity-80 transition">
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:opacity-80 transition">
              Contact
            </Link>
          </li>
        </ul>

        {/* Social */}
        <div className="flex items-center gap-5">
          {/* LinkedIn */}
          <Link href="#" aria-label="LinkedIn" target="_blank" rel="noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 hover:opacity-80 transition"
              fill="currentColor"
            >
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.3c0-1.74-.03-3.98-2.43-3.98-2.43 0-2.81 1.9-2.81 3.86V23h-4V8z"/>
            </svg>
          </Link>

          {/* X (Twitter) */}
          <Link href="#" aria-label="X" target="_blank" rel="noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 hover:opacity-80 transition"
              fill="currentColor"
            >
              <path d="M18.244 2H21l-6.59 7.523L22 22h-5.977l-4.68-6.1L5.9 22H3.142l7.09-8.09L2 2h6.023l4.246 5.64L18.244 2zm-2.098 18h2.09L8.01 4h-2.1l10.236 16z"/>
            </svg>
          </Link>

          {/* Instagram */}
          <Link href="#" aria-label="Instagram" target="_blank" rel="noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 hover:opacity-80 transition"
              fill="currentColor"
            >
              <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 110 2.24 1.12 1.12 0 010-2.24z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E7EB]" />

      {/* Bottom: Copyright only */}
      <div className="max-w-7xl mx-auto px-[10px] py-6 text-center text-sm text-[#64748B]">
        © {year} C&amp;A Retentions. All rights reserved.
      </div>
    </footer>
  );
}
