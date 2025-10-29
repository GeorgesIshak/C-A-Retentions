/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import type { MessageTemplate } from "@/lib/actions/subscription";
import { updateMessageTemplate } from "@/lib/actions/subscription";

export default function TemplateEditors({ initial }: { initial: MessageTemplate }) {
  // Prefill
  const [emailSubject, setEmailSubject] = useState(initial.emailTemplate?.subject ?? "");
  const [emailHtml, setEmailHtml] = useState(initial.emailTemplate?.html ?? "");
  const [smsContent, setSmsContent] = useState(initial.smsTemplate?.content ?? "");

  // Separate transitions
  const [isSavingEmail, startEmailTransition] = useTransition();
  const [isSavingSms, startSmsTransition] = useTransition();

  // Separate messages
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [smsMsg, setSmsMsg] = useState<string | null>(null);

  function saveEmail() {
    setEmailMsg(null);
    startEmailTransition(async () => {
      try {
        await updateMessageTemplate({
          emailTemplate: { subject: emailSubject, html: emailHtml },
        });
        setEmailMsg("Email template saved.");
      } catch (e: any) {
        setEmailMsg(e?.message || "Failed to save email template");
      }
    });
  }

  function saveSms() {
    setSmsMsg(null);
    startSmsTransition(async () => {
      try {
        await updateMessageTemplate({
          smsTemplate: { content: smsContent },
        });
        setSmsMsg("SMS template saved.");
      } catch (e: any) {
        setSmsMsg(e?.message || "Failed to save SMS template");
      }
    });
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Email Template */}
      <div className="p-4 border rounded-2xl bg-white flex flex-col h-full">
        <div>
          <h3 className="text-lg font-semibold mb-2">Create Email Template</h3>
          <p className="text-sm text-gray-500 mb-3">
            Enter the subject and body for your automated Email campaigns.
          </p>

          {emailMsg && (
            <div className="mb-3 rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-2 text-xs text-[#0B3A75]">
              {emailMsg}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Email Subject"
              className="w-full rounded-xl border border-[#E6EEF5] p-2 text-sm text-[#0F1F33]"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              disabled={isSavingEmail}
            />
            <textarea
              placeholder="Email Body (HTML allowed)"
              className="w-full min-h-[160px] md:min-h-[220px] rounded-2xl border border-[#E6EEF5] p-4 text-[14px] text-[#0F1F33] resize-y md:resize"
              value={emailHtml}
              onChange={(e) => setEmailHtml(e.target.value)}
              disabled={isSavingEmail}
            />
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveEmail}
            disabled={isSavingEmail}
            className="w-full md:w-auto rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            {isSavingEmail ? "Saving..." : "Save Email Template"}
          </button>
        </div>
      </div>

      {/* SMS Template */}
      <div className="p-4 border rounded-2xl bg-white flex flex-col h-full">
        <div>
          <h3 className="text-lg font-semibold mb-2">Create SMS Template</h3>
          <p className="text-sm text-gray-500 mb-3">
            Enter the message for your automated SMS campaigns.
          </p>

          {smsMsg && (
            <div className="mb-3 rounded-md bg-[#F1F8FF] border border-[#CFE4FF] p-2 text-xs text-[#0B3A75]">
              {smsMsg}
            </div>
          )}

          <div className="space-y-3">
            <textarea
              placeholder="SMS Message"
              className="w-full min-h-[180px] md:min-h-[270px] rounded-2xl border border-[#E6EEF5] p-4 text-[14px] text-[#0F1F33] resize-y md:resize"
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              disabled={isSavingSms}
            />
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveSms}
            disabled={isSavingSms}
            className="w-full md:w-auto rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            {isSavingSms ? "Saving..." : "Save SMS Template"}
          </button>
        </div>
      </div>
    </section>
  );
}
