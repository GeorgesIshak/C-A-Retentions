/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
};

export default function QrModal({ open, onClose, url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC + lock scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasUrl = Boolean(url);

  function handleDownload() {
    if (!canvasRef.current) return;
    try {
      const data = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = data;
      a.download = "qr-code.png";
      document.body.appendChild(a); // Safari needs it in the DOM
      a.click();
      a.remove();
    } catch {
      // no-op
    }
  }

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    // more robust than comparing to ref: only close if click is on backdrop itself
    if (e.currentTarget === e.target) onClose();
  }

  return (
    <div
      ref={dialogRef}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="QR Code modal"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">QR Code</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5EBF0] px-3 py-1 text-sm hover:bg-[#F8FAFB]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex justify-center min-h-[240px]">
          {hasUrl ? (
            // cast the ref to satisfy TS and ensure we get the <canvas>
            <QRCodeCanvas ref={canvasRef as any} value={url} size={220} includeMargin />
          ) : (
            <div className="text-sm text-[#6B7C8F] self-center">
              No URL provided.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={!hasUrl}
            className="rounded-xl bg-[#1C2E4A] px-6 py-2 text-sm text-white hover:opacity-95 disabled:opacity-50"
          >
            Download QR Code
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-[#E5EBF0] px-6 py-2 text-sm hover:bg-[#F8FAFB]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
