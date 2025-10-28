// components/ClientHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ClientHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const targetHref = isLoggedIn ? "/dashboard/profile" : "/login";

  // If these sections live on the homepage, use hash links
  const navItems = [
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Packages", href: "/#packages" },
    { name: "FAQ", href: "/#faq" },
      { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className="w-full border-b border-[#BDC4D4] bg-white px-[10px]">
      <div className="mx-auto max-w-7xl py-4 md:py-6">
        {/* MOBILE TOP BAR: burger | centered logo | user icon */}
       <div className="md:hidden grid grid-cols-3 items-center">
  {/* Burger (left) */}
  <button
    aria-label={open ? "Close menu" : "Open menu"}
    aria-expanded={open}
    className="justify-self-start relative z-[10000] flex flex-col justify-center items-center gap-[7px]"
    onClick={() => setOpen((v) => !v)}
  >
    <span className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${open ? "rotate-45 translate-y-[9px]" : ""}`} />
    <span className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${open ? "opacity-0" : ""}`} />
    <span className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${open ? "-rotate-45 -translate-y-[9px]" : ""}`} />
  </button>

  {/* Logo (center, bigger) */}
  <Link
    href="/dashboard/"
    className="justify-self-center relative block w-[180px] h-[48px]"
    aria-label="Go to dashboard"
  >
    <Image
      src="/images/logo.svg"
      alt="C&A Retentions"
      fill
      priority
      style={{ objectFit: "contain" }}
    />
  </Link>

  {/* User (right, slightly bigger) */}
  <Link
    href={targetHref}
    aria-label={isLoggedIn ? "Profile" : "Login"}
    className="justify-self-end"
  >
    <Image
      src="/images/usericon.svg"
      alt="User Icon"
      width={60}
      height={38}
      priority
    />
  </Link>
</div>


        {/* DESKTOP ROW */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo (left) */}
        {/* Logo (left) */}
<Link href="/dashboard/" className="relative block w-[240px] h-[56px]">
  <Image
    src="/images/logo.svg"
    alt="C&A Retentions"
    fill
    priority
    style={{ objectFit: "contain" }}
  />
</Link>


          {/* Links + user (right) */}
          <nav className="flex items-center gap-8" aria-label="Main Navigation">
            <ul className="flex items-center gap-8 text-sm  tracking-wide">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#1C2E4A] hover:opacity-80 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={targetHref}
              aria-label={isLoggedIn ? "Profile" : "Login"}
              className="ml-2"
            >
              <Image
                src="/images/usericon.svg"
                alt="User Icon"
                width={70}
                height={44}
                priority
              />
            </Link>
          </nav>
        </div>
      </div>

      {/* MOBILE DRAWER (single, white, top-most) */}
      <nav
        aria-label="Mobile Navigation"
        className={`md:hidden fixed inset-0 bg-white z-[9999] transition-[opacity,visibility] duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setOpen(false)}
      >
        <div
          className="pt-24 pb-10 px-6"
          onClick={(e) => e.stopPropagation()} // prevent closing when interacting inside
        >
          <ul className="flex flex-col gap-2 text-base uppercase">
            {navItems.map((item, i) => (
              <li
                key={item.name}
                className="border-b border-[#E3E6EE]"
                style={{
                  transition: "all 300ms",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <Link
                  href={item.href}
                  className="block py-4 text-[#1C2E4A] hover:opacity-80"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

    
        </div>
      </nav>
    </header>
  );
}
