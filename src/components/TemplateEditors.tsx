/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import type { MessageTemplate } from "@/lib/actions/subscription";
import { updateMessageTemplate } from "@/lib/actions/subscription";

export default function TemplateEditors({ initial }: { initial: MessageTemplate }) {
  const [isPending, startTransition] = useTransition();

  // prefill from server
  const [emailSubject, setEmailSubject] = useState(initial.emailTemplate?.subject ?? "");
  const [emailHtml, setEmailHtml] = useState(initial.emailTemplate?.html ?? "");
  const [smsContent, setSmsContent] = useState(initial.smsTemplate?.content ?? "");

  const [msg, setMsg] = useState<string | null>(null);
  const disabled = isPending;

  function saveEmail() {
    setMsg(null);
    startTransition(async () => {
      try {
        await updateMessageTemplate({
          emailTemplate: { subject: emailSubject, html: emailHtml },
        });
        setMsg("Email template saved.");
      } catch (e: any) {
        setMsg(e?.message || "Failed to save email template");
      }
    });
  }

  function saveSms() {
    setMsg(null);
    startTransition(async () => {
      try {
        await updateMessageTemplate({
          smsTemplate: { content: smsContent },
        });
        setMsg("SMS template saved.");
      } catch (e: any) {
        setMsg(e?.message || "Failed to save SMS template");
      }
    });
  }

  return (
    <>
      {msg && (
        <div className="rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-3 text-xs text-[#0B3A75]">
          {msg}
        </div>
      )}

      <section className="flex gap-6">
        {/* Email Template */}
        <div className="flex-1 p-4 border rounded-2xl bg-white">
          <h3 className="text-lg font-semibold mb-2">Create Email Template</h3>
          <p className="text-sm text-gray-500 mb-3">
            Enter the subject and body for your automated Email campaigns.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Email Subject"
              className="w-full rounded-xl border border-[#E6EEF5] p-2 text-sm text-[#0F1F33]"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              disabled={disabled}
            />
            <textarea
              placeholder="Email Body (HTML allowed)"
              className="w-full min-h-[140px] rounded-2xl border border-[#E6EEF5] p-4 text-[14px] text-[#0F1F33]"
              value={emailHtml}
              onChange={(e) => setEmailHtml(e.target.value)}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={saveEmail}
              disabled={disabled}
              className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-white text-sm disabled:opacity-60"
            >
              {disabled ? "Saving..." : "Save Email Template"}
            </button>
          </div>
        </div>

        {/* SMS Template */}
        <div className="flex-1 p-4 border rounded-2xl bg-white">
          <h3 className="text-lg font-semibold mb-2">Create SMS Template</h3>
          <p className="text-sm text-gray-500 mb-3">
            Enter the message for your automated SMS campaigns.
          </p>

          <div className="space-y-3">
            <textarea
              placeholder="SMS Message"
              className="w-full min-h-[140px] rounded-2xl border border-[#E6EEF5] p-4 text-[14px] text-[#0F1F33]"
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={saveSms}
              disabled={disabled}
              className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-white text-sm disabled:opacity-60"
            >
              {disabled ? "Saving..." : "Save SMS Template"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
