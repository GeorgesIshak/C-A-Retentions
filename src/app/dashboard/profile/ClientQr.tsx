// app/dashboard/profile/ClientQr.tsx
"use client";

import { useMemo, useState } from "react";
import QrModal from "@/components/qr/QrModal";

export function ClientQr({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);

  const qrUrl = useMemo(() => {
    if (typeof window === "undefined" || !userId) return "";
    const origin = window.location.origin;
    return `${origin}/guest-form?uid=${encodeURIComponent(userId)}`;
  }, [userId]);

  const disabled = !userId;

  return (
    <>
      <button
        type="button"
        onClick={() => (disabled ? alert("Please log in first") : setOpen(true))}
        disabled={disabled}
        className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-white text-sm disabled:opacity-50"
        title={disabled ? "Login required to generate QR" : "Generate QR"}
      >
        Generate QR
      </button>

      <QrModal open={open} onClose={() => setOpen(false)} url={qrUrl} />
    </>
  );
}
