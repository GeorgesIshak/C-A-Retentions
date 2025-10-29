"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export default function ClientHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const appNav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <header className="w-full border-b border-[#BDC4D4] bg-white px-[10px]">
      <div className="mx-auto max-w-7xl py-4 md:py-6">
        {/* MOBILE TOP BAR: burger | centered logo | logout icon */}
        <div className="md:hidden grid grid-cols-3 items-center">
          {/* Burger (left) */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="justify-self-start relative z-[10000] flex flex-col justify-center items-center gap-[7px]"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${
                open ? "rotate-45 translate-y-[9px]" : ""
              }`}
            />
            <span
              className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-8 h-[3.5px] bg-[#1C2E4A] transition-all ${
                open ? "-rotate-45 -translate-y-[9px]" : ""
              }`}
            />
          </button>

          {/* Logo (center) */}
          <Link
            href="/dashboard/"
            className="justify-self-center relative block w-[180px] h-[48px]"
            aria-label="Go to dashboard"
          >
            <Image
              src="/images/logo.svg"
              alt="C&A Retention"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Logout (right) */}
          {isLoggedIn && (
            <form action={logout} className="justify-self-end">
              <button
                type="submit"
                className="flex items-center justify-center rounded-full border border-[#D6E3EE] p-2 hover:bg-[#F1F6FA] transition"
                title="Logout"
                aria-label="Logout"
              >
                {/* 🔥 made icon bigger for phone */}
                <LogOut className="h-6 w-6 text-[#1C2E4A]" strokeWidth={2} />
              </button>
            </form>
          )}
        </div>

        {/* DESKTOP ROW */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo (left) */}
          <Link href="/dashboard/" className="relative block w-[240px] h-[56px]">
            <Image
              src="/images/logo.svg"
              alt="C&A Retention"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Desktop Nav + Logout */}
          <nav className="flex items-center gap-6" aria-label="Main Navigation">
            <ul className="flex items-center gap-6 text-[16px]">
              {appNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#1C2E4A] hover:text-[#3D6984] transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {isLoggedIn && (
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-full border border-[#D6E3EE] p-2 hover:bg-[#F1F6FA] transition"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-[#1C2E4A]" strokeWidth={2} />
                </button>
              </form>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <nav
        aria-label="Mobile Navigation"
        className={`md:hidden fixed inset-0 bg-white z-[9999] transition-[opacity,visibility] duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className="pt-24 pb-10 px-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* App links */}
          <ul className="flex flex-col gap-2 text-base uppercase">
            {appNav.map((item, i) => (
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

     {/* Logout button inside drawer */}
{isLoggedIn && (
  <form action={logout} className="mt-2">
    <button
      type="submit"
      className="w-full text-left border-b border-[#E3E6EE] py-4 text-[#1C2E4A] text-base uppercase hover:opacity-80 transition cursor-pointer"
    >
      Logout
    </button>
  </form>
)}

        </div>
      </nav>
    </header>
  );
}
