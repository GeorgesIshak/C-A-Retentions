/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Package } from "@/types/packagePlan";
import PackageCard from "./PackageCard";
import toast from "react-hot-toast";

const IMAGES = ["/images/package1.png", "/images/package2.png", "/images/package3.png"];

export default function PackageGrid({
  packages,
  authed = false,
  userHasActivePlan = false,
}: {
  packages: Package[];
  authed?: boolean;
  userHasActivePlan?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [open, setOpen] = useState<string | null>(packages?.[0]?.id ?? null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, Package>();
    for (const p of packages) map.set(p.id, p);
    return map;
  }, [packages]);

  const spanFor = (id: string) =>
    ["col-span-1", open === null ? "md:col-span-4" : open === id ? "md:col-span-8" : "md:col-span-2"].join(" ");

  // Auto-start checkout when coming back from login with ?start=<id>
  useEffect(() => {
    const startId = searchParams.get("start");
    if (!authed || !startId || loadingId) return;

    // Already subscribed? show a toast and stop.
    if (userHasActivePlan) {
      toast("You already have an active plan.", { icon: "⚠️" });
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("start");
      router.replace(sp.toString() ? `${pathname}?${sp}` : pathname);
      return;
    }

    const target = byId.get(startId);
    if (!target) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("start");
      router.replace(sp.toString() ? `${pathname}?${sp}` : pathname);
      return;
    }

    const isActive = (target as any).isActive !== undefined ? Boolean((target as any).isActive) : true;
    const priceId = (target as any).priceId;
    if (!isActive || !priceId) {
      toast.error("This package is unavailable. Please pick another.");
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("start");
      router.replace(sp.toString() ? `${pathname}?${sp}` : pathname);
      return;
    }

    setOpen(target.id);
    setLoadingId(target.id);

    (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId }),
        });

        if (res.ok) {
          const { url } = await res.json();
          if (!url) throw new Error("No checkout URL returned.");
          window.location.href = url;
          return;
        }

        // Graceful duplicate guard & other errors
        if (res.status === 403) {
          toast("You already have an active plan.", { icon: "⚠️" });
        } else {
          const msg = await res.text();
          toast.error(msg || "Failed to create checkout session.");
        }
      } catch (err: any) {
        toast.error(err?.message || "Couldn’t start checkout. Please try again.");
      } finally {
        setLoadingId(null);
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete("start");
        router.replace(sp.toString() ? `${pathname}?${sp}` : pathname);
      }
    })();
  }, [authed, byId, loadingId, pathname, router, searchParams, userHasActivePlan]);

  if (!packages?.length) {
    return (
      <section className="mt-12 md:mt-16">
        <div className="rounded-2xl border border-white/10 p-6 text-sm text-white/70">
          No packages available yet.
        </div>
      </section>
    );
  }

  function handleProceed(pkg: Package) {
    if (loadingId) return;

    // Block immediately if already subscribed
    if (userHasActivePlan) {
      toast("You already have an active plan.", { icon: "⚠️" });
      return;
    }

    const startParam = encodeURIComponent(pkg.id);
    const next = `/?start=${startParam}`;
    if (!authed) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
    } else {
      router.push(next); // effect above will auto-start
    }
  }

  return (
    <section className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {packages.map((pkg, index) => (
        <PackageCard
          key={pkg.id}
          title={pkg.name}
          price={Number(pkg.price)}
          description={pkg.description ?? ""}
          sms={Number(pkg.smsCount)}
          whatsapp={Number(pkg.whatsappCount)}
          emails={Number(pkg.emailCount)}
          open={open === pkg.id}
          onClick={() => setOpen(open === pkg.id ? null : pkg.id)}
          onProceed={() => handleProceed(pkg)}
          className={[
            spanFor(pkg.id),
            loadingId === pkg.id ? "opacity-75 pointer-events-none" : "",
          ].join(" ")}
          bgImage={IMAGES[index % IMAGES.length]}
          // Swap CTA when active
          ctaLabel={userHasActivePlan ? "Already subscribed" : loadingId === pkg.id ? "Processing…" : "Proceed"}
        />
      ))}
    </section>
  );
}
