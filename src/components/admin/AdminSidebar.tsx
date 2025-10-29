'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth-admin";

const NAV = [
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/tenants", label: "Tenants" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 border-r border-[#E6EEF5] bg-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-[#E6EEF5]">
        <Link href="/admin/packages">
          <Image
            src="/images/logo.svg"
            alt="C&A Retention"
            width={180}
            height={42}
            priority
            className="object-contain"
          />
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={[
              "block rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-[#F1F6FA] text-[#22384F] border border-[#E6EEF5]"
                : "text-[#2F4B6A] hover:bg-[#F8FBFF]"
            ].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout button pinned bottom */}
      <div className="p-4 border-t border-[#E6EEF5] bg-white">
<form action={logout}>
          <button
            className="w-full rounded-lg bg-gradient-to-b from-[#3D6984] to-[#1C2E4A]
                       px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
