"use client";

import { QRCodeCanvas } from "qrcode.react";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
};

export default function QrModal({ open, onClose, url }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3>QR Code</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5EBF0] px-3 py-1 text-sm hover:bg-[#F8FAFB]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <QRCodeCanvas value={url} size={220} includeMargin />
        </div>

        {/* Centered Download Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              const canvas = document.querySelector("canvas") as HTMLCanvasElement;
              if (!canvas) return;
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = "qr-code.png";
              a.click();
            }}
            className="rounded-xl bg-[#1C2E4A] px-6 py-2 text-sm text-white hover:opacity-95"
          >
            Download QR Code
          </button>
        </div>

      
      </div>
    </div>
  );
}
