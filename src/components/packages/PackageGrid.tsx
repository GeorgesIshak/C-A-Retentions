"use client";

import { useState } from "react";
import type { PackagePlan } from "@/types/packagePlan";
import PackageCard from "./PackageCard";

const IMAGES = [
  "/images/package1.png",
  "/images/package2.png",
  "/images/package3.png",
];

export default function PackageGrid({ packages }: { packages: PackagePlan[] }) {
  const [open, setOpen] = useState<number | null>(packages?.[0]?.id ?? null);

  const spanFor = (id: number) =>
    open === null
      ? "md:col-span-4"
      : open === id
      ? "md:col-span-8"
      : "md:col-span-2";

  if (!packages?.length) {
    return (
      <section className="mt-12 md:mt-16">
        <div className="rounded-2xl border border-white/10 p-6 text-sm text-white/70">
          No packages available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {packages.map((pkg, index) => (
        <PackageCard
          key={pkg.id}
          {...pkg}
          bgImage={IMAGES[index % IMAGES.length]}
          open={open === pkg.id}
          onClick={() => setOpen(open === pkg.id ? null : pkg.id)}
          className={spanFor(pkg.id)}
        />
      ))}
    </section>
  );
}
