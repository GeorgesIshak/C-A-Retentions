/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import type { MessageTemplate } from "@/lib/actions/subscription";
import { updateMessageTemplate } from "@/lib/actions/subscription";

const DEFAULT_EMAIL_SUBJECT = "Hello — please edit your email subject";
const DEFAULT_EMAIL_HTML = `<p>Hello — please edit your email template before sending. Replace this text with your content.</p>`;
const DEFAULT_SMS = "Hello — please edit your SMS template before sending.";
const DEFAULT_WHATSAPP = "Hello — please edit your WhatsApp template before sending.";

export default function TemplateEditors({ initial }: { initial: MessageTemplate }) {
  // Prefill with saved value OR default (no nulls)
  const [emailSubject, setEmailSubject] = useState(
    (initial.emailTemplate?.subject ?? "").trim() || DEFAULT_EMAIL_SUBJECT
  );
  const [emailHtml, setEmailHtml] = useState(
    (initial.emailTemplate?.html ?? "").trim() || DEFAULT_EMAIL_HTML
  );
  const [smsContent, setSmsContent] = useState(
    (initial.smsTemplate?.content ?? "").trim() || DEFAULT_SMS
  );
  const [whatsappContent, setWhatsappContent] = useState(
    (initial.whatsappTemplate?.content ?? "").trim() || DEFAULT_WHATSAPP
  );

  // Separate transitions
  const [isSavingEmail, startEmailTransition] = useTransition();
  const [isSavingSms, startSmsTransition] = useTransition();
  const [isSavingWhatsapp, startWhatsappTransition] = useTransition();

  // Separate messages
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [smsMsg, setSmsMsg] = useState<string | null>(null);
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null);

  async function saveEmail() {
    setEmailMsg(null);
    startEmailTransition(async () => {
      try {
        // use fallback defaults if user cleared the fields
        await updateMessageTemplate({
          emailTemplate: {
            subject: emailSubject?.trim() || DEFAULT_EMAIL_SUBJECT,
            html: emailHtml?.trim() || DEFAULT_EMAIL_HTML,
          },
        });
        setEmailMsg("Email template saved.");
      } catch (e: any) {
        setEmailMsg(e?.message || "Failed to save email template");
      }
    });
  }

  async function saveSms() {
    setSmsMsg(null);
    startSmsTransition(async () => {
      try {
        await updateMessageTemplate({
          smsTemplate: { content: smsContent?.trim() || DEFAULT_SMS },
        });
        setSmsMsg("SMS template saved.");
      } catch (e: any) {
        setSmsMsg(e?.message || "Failed to save SMS template");
      }
    });
  }

  async function saveWhatsapp() {
    setWhatsappMsg(null);
    startWhatsappTransition(async () => {
      try {
        await updateMessageTemplate({
          whatsappTemplate: { content: whatsappContent?.trim() || DEFAULT_WHATSAPP },
        });
        setWhatsappMsg("WhatsApp template saved.");
      } catch (e: any) {
        setWhatsappMsg(e?.message || "Failed to save WhatsApp template");
      }
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,1.4fr] items-start">
      {/* LEFT: Email big card */}
      <div className="rounded-3xl border border-[#E0E7F0] bg-white shadow-sm p-5 md:p-6 flex flex-col h-full">
        <header className="mb-4">
          <span className="inline-flex items-center rounded-full bg-[#E6EEF5] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#3D6984]">
            Email
          </span>
          <h3 className="mt-2 text-lg font-semibold text-[#0F1F33]">
            Create Email Template
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter the subject and body for your automated Email campaigns.
          </p>
        </header>

        {emailMsg && (
          <div className="mb-3 rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-2 text-xs text-[#0B3A75]">
            {emailMsg}
          </div>
        )}

        <div className="space-y-3 flex-1">
          <input
            type="text"
            placeholder="Email Subject"
            className="w-full rounded-xl border border-[#E6EEF5] bg-[#F9FBFF] p-2.5 text-sm text-[#0F1F33] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D6984]/30"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            disabled={isSavingEmail}
          />
          <textarea
            placeholder="Email Body (HTML allowed)"
            className="w-full min-h-[180px] md:min-h-[230px] rounded-2xl border border-[#E6EEF5] bg-[#F9FBFF] p-4 text-[14px] text-[#0F1F33] placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#3D6984]/30"
            value={emailHtml}
            onChange={(e) => setEmailHtml(e.target.value)}
            disabled={isSavingEmail}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveEmail}
            disabled={isSavingEmail}
            className="w-full md:w-auto rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-5 py-2.5 text-white text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {isSavingEmail ? "Saving..." : "Save Email Template"}
          </button>
        </div>
      </div>

      {/* RIGHT: SMS + WhatsApp side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SMS card */}
        <div className="rounded-3xl border border-[#E0E7F0] bg-white shadow-sm p-5 flex flex-col h-full">
          <header className="mb-3">
            <span className="inline-flex items-center rounded-full bg-[#E6EEF5] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#3D6984]">
              SMS
            </span>
            <h3 className="mt-2 text-base font-semibold text-[#0F1F33]">
              Create SMS Template
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter the message for your automated SMS campaigns.
            </p>
          </header>

          {smsMsg && (
            <div className="mb-3 rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-2 text-xs text-[#0B3A75]">
              {smsMsg}
            </div>
          )}

          <textarea
            placeholder="SMS Message"
            className="w-full min-h-[140px] rounded-2xl border border-[#E6EEF5] bg-[#F9FBFF] p-4 text-[14px] text-[#0F1F33] placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#3D6984]/30"
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            disabled={isSavingSms}
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveSms}
              disabled={isSavingSms}
              className="w-full md:w-auto rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-5 py-2.5 text-white text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {isSavingSms ? "Saving..." : "Save SMS Template"}
            </button>
          </div>
        </div>

        {/* WhatsApp card */}
        <div className="rounded-3xl border border-[#E0E7F0] bg-white shadow-sm p-5 flex flex-col h-full">
          <header className="mb-3">
            <span className="inline-flex items-center rounded-full bg-[#E6EEF5] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#3D6984]">
              WhatsApp
            </span>
            <h3 className="mt-2 text-base font-semibold text-[#0F1F33]">
              Create WhatsApp Template
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter the message for your automated WhatsApp campaigns.
            </p>
          </header>

          {whatsappMsg && (
            <div className="mb-3 rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-2 text-xs text-[#0B3A75]">
              {whatsappMsg}
            </div>
          )}

          <textarea
            placeholder="WhatsApp Message"
            className="w-full min-h-[140px] rounded-2xl border border-[#E6EEF5] bg-[#F9FBFF] p-4 text-[14px] text-[#0F1F33] placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#3D6984]/30"
            value={whatsappContent}
            onChange={(e) => setWhatsappContent(e.target.value)}
            disabled={isSavingWhatsapp}
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveWhatsapp}
              disabled={isSavingWhatsapp}
              className="w-full md:w-auto rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-5 py-2.5 text-white text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {isSavingWhatsapp ? "Saving..." : "Save WhatsApp Template"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
