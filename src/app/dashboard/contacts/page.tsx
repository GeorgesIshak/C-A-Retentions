"use client";

import { useState } from "react";
import QrModal from "@/components/qr/QrModal";

type Contact = {
  id: string;
  createdAt: string;          // ISO
  fullName: string;
  email: string;
  phone: string;
  templateId?: string | null; // chosen template per row
};

// Message templates (mock for now)
const TEMPLATES = [
  { id: "sms-welcome", label: "SMS — Welcome" },
  { id: "sms-thanks",  label: "SMS — Thanks for visiting" },
  { id: "email-promo", label: "Email — Promo 10% off" },
];

export default function ContactsPage() {
  // Start empty — this matches your “first load” requirement
  const [rows, setRows] = useState<Contact[]>([]);
  const [qrOpen, setQrOpen] = useState(false);

  // later: backend should return this URL (POST /qr). For now just mock it:
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const token  = "tenant_demo_token"; // replace with real token when backend is ready
  const qrUrl  = `${appUrl}/guest-form?t=${encodeURIComponent(token)}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <h1 className="text-[28px] font-bold text-[#0F1F33] mb-6">Contacts</h1>

      {/* Header bar */}
      <div className="rounded-2xl bg-[#F1F6FA] px-5 py-3 text-[#22384F] font-semibold text-[12px] uppercase tracking-wide">
        <div className="grid grid-cols-6">
          <div>Date Added</div>
          <div>Full Name</div>
          <div>Email</div>
          <div>Phone Number</div>
          <div>Select Message Template</div>
          <div className="text-right">Action</div>
        </div>
      </div>

      {/* CONTENT */}
      {rows.length === 0 ? (
        /* ---- EMPTY STATE ---- */
        <div className="mt-3 rounded-2xl border border-[#E6EEF5] bg-white">
          <div className="border-t border-dashed border-[#CAD7E5]" />
          <div className="grid grid-cols-6 items-center">
            <div className="col-span-5 px-5 py-6 text-sm text-[#7B8896]">
              Table is empty.
            </div>
            <div className="px-5 py-6 flex justify-end">
              <button
                onClick={() => setQrOpen(true)}
                className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white shadow hover:opacity-95"
              >
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---- ROWS ---- */
        <ul className="mt-3 space-y-3">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-[14px] border border-[#E6EEF5] bg-white shadow-[0_1px_0_0_rgba(16,24,40,0.02)]"
            >
              <div className="grid grid-cols-6 items-center px-5 py-4 text-[14px] text-[#0F1F33]">
                <div className="text-[#6B7C8F]">
                  {new Date(c.createdAt).toLocaleDateString("en-GB")}
                </div>
                <div>{c.fullName}</div>
                <div className="text-[#2F4B6A]">{c.email}</div>
                <div className="text-[#2F4B6A]">{c.phone}</div>

                {/* Template cell */}
                <div className="min-w-0">
                  <TemplateSelect
                    value={c.templateId ?? ""}
                    onChange={(tpl) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === c.id ? { ...r, templateId: tpl || null } : r
                        )
                      )
                    }
                  />
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <button className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white hover:opacity-95">
                    Configure Message
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* QR modal */}
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={qrUrl} />
    </main>
  );
}

/* ---------- Template dropdown cell ---------- */
function TemplateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#D6E3EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3D6984]"
      >
        <option value="">Select a template…</option>
        {TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {/* tiny settings icon */}
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-[#2F4B6A]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.44 2.6l.06.06c.47.47 1.15.61 1.82.33H9.4A1.65 1.65 0 0 0 11 1.49V1.4a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51.61.25 1.35.12 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.25.61.85 1 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    </div>
  );
}
