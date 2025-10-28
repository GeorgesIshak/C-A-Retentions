/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/contacts/ContactsPage.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendMessage } from "@/lib/actions/subscription";

type Contact = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  templateId?: string | null;
};

export default function ContactsPage({
  initialRows,
}: {
  userId: string | null;
  initialRows: Contact[];
}) {
  const [rows] = useState<Contact[]>(initialRows);

  const router = useRouter();
  const sp = useSearchParams();

  // Read modal state from URL (?configure=<contactId>)
  const configureId = sp.get("configure"); // string | null
  const cfgOpen = Boolean(configureId);




  function openConfigure(c: Contact) {
    const params = new URLSearchParams(sp.toString());
    params.set("configure", c.id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function closeConfigure() {
    const params = new URLSearchParams(sp.toString());
    params.delete("configure");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="mx-auto max-w-7xl">
      

      <div className="grid grid-cols-2 items-center">
        <h1 className="text-[28px] font-bold text-[#0F1F33] mb-6">Contacts</h1>
  
      </div>

      {/* Header */}
<div className="hidden md:block rounded-2xl bg-[#F1F6FA] px-5 py-3 text-[#22384F] font-semibold text-[12px] uppercase tracking-wide">
        <div className="grid grid-cols-5">
          <div>Date Added</div>
          <div>Full Name</div>
          <div>Email</div>
          <div>Phone Number</div>
          <div className="text-right">Action</div>
        </div>
      </div>

      {/* Content */}
      {rows.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-[#E6EEF5] bg-white">
          <div className="border-t border-dashed border-[#CAD7E5]" />
          <div className="grid items-center">
            <div className="px-5 py-6 text-sm text-[#7B8896]">Table is empty.</div>
          </div>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((c) => (
       <li
  key={c.id}
  className="rounded-[14px] border border-[#E6EEF5] bg-white shadow-[0_1px_0_0_rgba(16,24,40,0.02)]"
>
  {/* Mobile card */}
  <div className="md:hidden px-4 py-4 space-y-3">
    <div className="flex items-start justify-between gap-4">
      <div className="text-[#0F1F33]">
        <div className="font-medium">{c.fullName || '—'}</div>
        <div className="text-xs text-[#6B7C8F]">
          {new Date(c.createdAt).toLocaleDateString('en-GB')}
        </div>
      </div>
      <button
        onClick={() => openConfigure(c)}
        className="shrink-0 rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-3 py-1.5 text-xs text-white"
      >
        Configure
      </button>
    </div>

    <div className="text-[13px]">
      <div className="text-[#6B7C8F]">Email</div>
      <div className="break-words text-[#2F4B6A]">{c.email || '—'}</div>
    </div>

    <div className="text-[13px]">
      <div className="text-[#6B7C8F]">Phone</div>
      <div className="break-words text-[#2F4B6A]">{c.phone || '—'}</div>
    </div>
  </div>

  {/* Desktop row */}
  <div className="hidden md:grid grid-cols-5 items-center px-5 py-4 text-[14px] text-[#0F1F33]">
    <div className="text-[#6B7C8F]">
      {new Date(c.createdAt).toLocaleDateString('en-GB')}
    </div>
    <div className="truncate">{c.fullName}</div>
    <div className="text-[#2F4B6A] truncate">{c.email}</div>
    <div className="text-[#2F4B6A] truncate">{c.phone}</div>
    <div className="flex justify-end">
      <button
        onClick={() => openConfigure(c)}
        className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-sm text-white hover:opacity-95"
      >
        Configure Message
      </button>
    </div>
  </div>
</li>

          ))}
        </ul>
      )}


      {/* URL-driven Configure Message Modal */}
      <ConfigureMessageModal
        open={cfgOpen}
        onClose={closeConfigure}
        contactId={configureId}
      />
    </main>
  );
}
/* -------------------- Modal Component -------------------- */

function ConfigureMessageModal({
  open,
  onClose,
  contactId,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string | null;
}) {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const [date, setDate] = useState(today); // default to today
  const [time, setTime] = useState("09:00"); // default to 09:00 AM
  const [type, setType] = useState<"send-message" | "send-email">("send-message");

  // Template mode & fields
  const [mode, setMode] = useState<"saved" | "custom">("saved");
  const [smsContent, setSmsContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtml, setEmailHtml] = useState("");

  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  React.useEffect(() => {
    if (open) {
      setNotice(null);
      setPending(false);
     setDate(today);   // <-- default to today
    setTime("09:00"); // <-- default time
    setType("send-message");
      setMode("saved");
      setSmsContent("");
      setEmailSubject("");
      setEmailHtml("");
    }
  }, [open, contactId,today]);

  if (!open || !contactId) return null;

  // Narrow to non-null once (fixes TS2322 for clientId)
  const cid: string = contactId;

  function combineDateTimeLocal(d: string, t: string): Date | null {
    if (!d || !t) return null;
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);
    return new Date(y, (m ?? 1) - 1, day ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const when = combineDateTimeLocal(date, time);
    if (!when) {
      setNotice({ kind: "err", msg: "Please select both date and time." });
      return;
    }

    try {
      setPending(true);

      // Optional per-send template override
      let template:
        | undefined
        | {
            smsTemplate?: { content: string };
            emailTemplate?: { subject: string; html: string };
          };

      if (mode === "custom") {
        if (type === "send-message") {
          if (!smsContent.trim()) {
            setNotice({ kind: "err", msg: "Please enter the SMS message." });
            setPending(false);
            return;
          }
          template = { smsTemplate: { content: smsContent.trim() } };
        } else {
          if (!emailSubject.trim() || !emailHtml.trim()) {
            setNotice({ kind: "err", msg: "Please enter email subject and HTML body." });
            setPending(false);
            return;
          }
          template = {
            emailTemplate: {
              subject: emailSubject.trim(),
              html: emailHtml, // allow raw HTML
            },
          };
        }
      }

      await sendMessage({
        clientId: cid,
        type, // "send-message" | "send-email"
        date: when, // server action converts to UTC ISO
        ...(template ? { template } : {}),
      });

      setNotice({ kind: "ok", msg: "Scheduled successfully." });
      setTimeout(onClose, 900);
    } catch (err: any) {
      setNotice({
        kind: "err",
        msg: err?.message || "Failed to schedule. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canSubmit =
    !!date &&
    !!time &&
    !pending &&
    (mode === "saved" ||
      (type === "send-message" ? !!smsContent.trim() : !!emailSubject.trim() && !!emailHtml.trim()));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
  <div className="w-full max-w-lg md:max-h-[90vh] rounded-2xl bg-white p-6 shadow-xl overflow-y-auto
                  max-h-[calc(100dvh-2rem)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configure Message</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-[#E6EEF5] px-2 py-1 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F1F33]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[#E6EEF5] p-2 text-sm text-[#0F1F33]"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F1F33]">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-[#E6EEF5] p-2 text-sm text-[#0F1F33]"
              required
            />
          </div>

          {/* Message type */}
          <div>
            <div className="mb-1 text-sm font-medium text-[#0F1F33]">Message</div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="msgtype"
                  checked={type === "send-message"}
                  onChange={() => setType("send-message")}
                />
                SMS
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="msgtype"
                  checked={type === "send-email"}
                  onChange={() => setType("send-email")}
                />
                Email
              </label>
            </div>
          </div>

          {/* Template mode */}
          <div>
            <div className="mb-1 text-sm font-medium text-[#0F1F33]">Template</div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="templatemode"
                  checked={mode === "saved"}
                  onChange={() => setMode("saved")}
                />
                Use saved template
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="templatemode"
                  checked={mode === "custom"}
                  onChange={() => setMode("custom")}
                />
                Write custom
              </label>
            </div>
          </div>

          {/* Custom fields (conditional) */}
          {mode === "custom" && type === "send-message" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0F1F33]">SMS Content</label>
              <textarea
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
  className="w-full min-h-[140px] md:min-h-[160px] rounded-2xl border border-[#E6EEF5] p-3 text-[14px] text-[#0F1F33] break-words"
                placeholder="Type the SMS text here…"
              />
              <div className="mt-1 text-xs text-[#7B8896]">
                Tip: keep it short; some carriers segment long SMS automatically.
              </div>
            </div>
          )}

          {mode === "custom" && type === "send-email" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F1F33]">
                  Email Subject
                </label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-xl border border-[#E6EEF5] p-2 text-sm text-[#0F1F33]"
                  placeholder="Subject…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F1F33]">
                  Email HTML Body
                </label>
                <textarea
                  value={emailHtml}
                  onChange={(e) => setEmailHtml(e.target.value)}
  className="w-full min-h-[140px] md:min-h-[160px] rounded-2xl border border-[#E6EEF5] p-3 text-[14px] text-[#0F1F33] break-words"
                  placeholder="<h2>Special Offer</h2>..."
                />
                <div className="mt-1 text-xs text-[#7B8896]">
                  You can paste raw HTML. Links, buttons, etc. are supported by your backend sender.
                </div>
              </div>
            </>
          )}

          {notice && (
            <div
              className={`rounded-md border p-3 text-sm ${
                notice.kind === "ok"
                  ? "border-[#CFE4FF] bg-[#F1F8FF] text-[#0B3A75]"
                  : "border-[#FFE0E0] bg-[#FFF7F7] text-[#9A3A3A]"
              }`}
            >
              {notice.msg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                !date ||
                !time ||
                pending ||
                (mode === "custom" &&
                  (type === "send-message"
                    ? !smsContent.trim()
                    : !emailSubject.trim() || !emailHtml.trim()))
              }
              className="w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white text-sm disabled:opacity-60"
              onClick={handleSubmit}
            >
              {pending ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}