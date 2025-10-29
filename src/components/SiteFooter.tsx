import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#1C2E4A] border-t border-[#BDC4D4] mt-10">
      {/* Top: Logo + tagline */}
      <div className="max-w-7xl mx-auto px-[10px] py-10 flex flex-col items-center text-center gap-6">
        <Link
          href="/"
          aria-label="C&A Retention Home"
          className="relative block w-[220px] h-[54px]"
        >
          <Image
            src="/images/logo.svg"
            alt="C&A Retention"
            fill
            priority
            style={{ objectFit: "contain" }}
          />
        </Link>

        <p className="max-w-2xl text-sm leading-relaxed text-[#334155]">
          C&amp;A Retention helps your business capture, nurture, and retain
          customers with streamlined tools for packages, messaging, and analytics—
          without the busywork. Built to be fast, clear, and effective.
        </p>
      </div>

      {/* Middle: Menu + Contact */}
      <div className="max-w-7xl mx-auto px-[10px] py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Menu */}
        <ul className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm capitalize tracking-wide">
          <li>
            <Link href="/#how-it-works" className="hover:opacity-80 transition">
              How it Works
            </Link>
          </li>
          <li>
            <Link href="/#packages" className="hover:opacity-80 transition">
              Packages
            </Link>
          </li>
          <li>
            <Link href="/#faq" className="hover:opacity-80 transition">
              Faq
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:opacity-80 transition">
              Contact
            </Link>
          </li>
        </ul>

        {/* Contact Icons */}
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          {/* Email */}
          <a
            href="mailto:contact@yourcompany.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#3D6984] hover:opacity-80 transition"
          >
            <Mail size={20} />
          </a>

          {/* Phone */}
          <a
            href="tel:+966555123456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#3D6984] hover:opacity-80 transition"
          >
            <Phone size={20} />
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E7EB]" />

      {/* Bottom: Copyright */}
      <div className="max-w-7xl mx-auto px-[10px] py-6 text-center text-sm text-[#64748B]">
        © {year} C&amp;A Retention. All rights reserved.
      </div>
    </footer>
  );
}
