/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';

const BRAND_FOOTER_MARK = '<!-- BRAND_FOOTER -->';
const BRAND_FOOTER_HTML = `
${BRAND_FOOTER_MARK}
<hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
<div style="text-align:center;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:block;margin:0 auto 6px;width:90px;">
    <!-- Inline SVG logo -->
  <svg xmlns="http://www.w3.org/2000/svg" width="266" height="60" viewBox="0 0 266 60" fill="none">
      <!-- ... your SVG paths unchanged ... -->
  </svg>
  </div>
  <div style="font-size:14px;font-weight:600;color:#1C2E4A;">
    Communication Provider <span style="color:#3D6984;">C&A Retention</span>
  </div>
</div>
`;
/* add this near the top, under other helpers */
async function readErr(res: Response, fallback = 'Request failed') {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j: any = await res.json();
      const m = j?.message || j?.error || j?.detail || j?.title;
      if (Array.isArray(m)) return m.join(', ');
      if (typeof m === 'string' && m.trim()) return m;
      // fall back to stringify known fields
      return j?.message || fallback;
    }
    const t = await res.text();
    return t || fallback;
  } catch {
    return fallback;
  }
}

function withBrandFooter(html?: string | null) {
  const base = html ?? '';
  if (!base) return BRAND_FOOTER_HTML;
  if (base.includes(BRAND_FOOTER_MARK)) return base; // already has it
  return `${base}\n${BRAND_FOOTER_HTML}`;
}

/** Read inside functions; don't throw at module import time */
function requireApiUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new Error('BACKEND_API_URL is not configured');
  return url;
}

// ---------------------------------------
// Check if user has an active plan
// ---------------------------------------
export async function hasActivePlan(): Promise<boolean> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return false;

  const API_URL = requireApiUrl();

  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return false;

    const p: any = await res.json().catch(() => ({}));
    const expiry = p?.expiryDate ? new Date(p.expiryDate) : null;
    return !!expiry && expiry.getTime() > Date.now();
  } catch (err) {
    console.error('hasActivePlan network/error:', err);
    return false;
  }
}

// ---------------------------------------
// Message Template: types
// ---------------------------------------
export type SmsTemplate = { content: string };
export type EmailTemplate = { subject: string; html: string };
// ✅ WhatsApp template
export type WhatsappTemplate = { content: string };

export type MessageTemplate = {
  id?: string;
  smsTemplate?: SmsTemplate | null;
  emailTemplate?: EmailTemplate | null;
  whatsappTemplate?: WhatsappTemplate | null; // ✅ NEW
};

// Small auth header helper
async function authHeaders() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('No access token found');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  } as const;
}

// ---------------------------------------
// GET /users/message-template
// ---------------------------------------
export async function getMessageTemplate(): Promise<MessageTemplate> {
  const API_URL = requireApiUrl();

  try {
    const res = await fetch(`${API_URL}/users/message-template`, {
      method: 'GET',
      headers: await authHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Failed to load message template');
    }

    return res.json();
  } catch (err: any) {
    console.error('getMessageTemplate error:', err);
    throw new Error(
      err?.message || 'Failed to load message template. Please try again later.'
    );
  }
}

// ---------------------------------------
// PUT /users/message-template
// ---------------------------------------
export async function updateMessageTemplate(input: {
  smsTemplate?: Partial<SmsTemplate> | null;
  emailTemplate?: Partial<EmailTemplate> | null;
  whatsappTemplate?: Partial<WhatsappTemplate> | null; // ✅ NEW
}): Promise<MessageTemplate> {
  const API_URL = requireApiUrl();

  const body: Record<string, unknown> = {};
  if (input.smsTemplate)
    body.smsTemplate = { content: input.smsTemplate.content ?? '' };
  if (input.emailTemplate)
    body.emailTemplate = {
      subject: input.emailTemplate.subject ?? '',
      html: input.emailTemplate.html ?? '',
    };
  if (input.whatsappTemplate)
    body.whatsappTemplate = { content: input.whatsappTemplate.content ?? '' };

  try {
    const res = await fetch(`${API_URL}/users/message-template`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || 'Failed to update message template');
    }

    return res.json();
  } catch (err: any) {
    console.error('updateMessageTemplate error:', err);
    throw new Error(
      err?.message || 'Failed to update message template. Please try again later.'
    );
  }
}

// ---------------------------------------
// POST /users/send-message  (schedule SMS/Email/WhatsApp)
// ---------------------------------------
export type FrontendMessageType =
  | 'send-message'
  | 'send-email'
  | 'send-whatsapp'; // ✅ NEW
export async function sendMessage(payload: {
  clientId: string;
  type: FrontendMessageType; // 'send-message' | 'send-email' | 'send-whatsapp'
  date?: Date | string;
  /** optional: override default template on this send */
  template?: {
    smsTemplate?: SmsTemplate;
    emailTemplate?: EmailTemplate;
    whatsappTemplate?: WhatsappTemplate;
  };
}) {
  const API_URL = requireApiUrl();

  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('No access token found');

  const utcDate =
    payload.date instanceof Date
      ? payload.date.toISOString()
      : payload.date
      ? new Date(payload.date).toISOString()
      : undefined;

  // Start from any custom template
  let templateToSend = payload.template;

  // Helper: try to ensure templateToSend contains saved templates if missing
  async function ensureSavedTemplatesIfMissing() {
    // If we already have any templates provided in payload.template, we won't override them,
    // but we may fill missing ones from saved templates if UI expects them.
    try {
      const saved = await getMessageTemplate().catch(() => null);
      if (!saved) return;

      templateToSend = {
        ...(templateToSend ?? {}),
        // only fill if value missing
        smsTemplate:
          templateToSend?.smsTemplate?.content
            ? templateToSend.smsTemplate
            : saved.smsTemplate && saved.smsTemplate.content
            ? { content: saved.smsTemplate.content }
            : templateToSend?.smsTemplate ?? undefined,
        emailTemplate:
          templateToSend?.emailTemplate?.html
            ? templateToSend.emailTemplate
            : saved.emailTemplate && saved.emailTemplate.html
            ? { subject: saved.emailTemplate.subject ?? '', html: saved.emailTemplate.html }
            : templateToSend?.emailTemplate ?? undefined,
        whatsappTemplate:
          templateToSend?.whatsappTemplate?.content
            ? templateToSend.whatsappTemplate
            : saved.whatsappTemplate && saved.whatsappTemplate.content
            ? { content: saved.whatsappTemplate.content }
            : templateToSend?.whatsappTemplate ?? undefined,
      };
    } catch (err) {
      // ignore - we'll handle missing templates below
      console.error('ensureSavedTemplatesIfMissing error', err);
    }
  }

  // Try to fill from saved templates when appropriate (so we can pre-check)
  await ensureSavedTemplatesIfMissing();

  // --- Determine requested channels ---
  // If payload.template explicitly included one or more templates, infer channels from that.
  const requestedChannels = new Set<'sms' | 'email' | 'whatsapp'>();
  if (payload.template) {
    if (payload.template.smsTemplate) requestedChannels.add('sms');
    if (payload.template.emailTemplate) requestedChannels.add('email');
    if (payload.template.whatsappTemplate) requestedChannels.add('whatsapp');
  }

  // If no explicit template keys, map payload.type to channel(s)
  if (requestedChannels.size === 0) {
    if (payload.type === 'send-message') requestedChannels.add('sms');
    if (payload.type === 'send-email') requestedChannels.add('email');
    if (payload.type === 'send-whatsapp') requestedChannels.add('whatsapp');
  }

  // Now check presence of templates for each requested channel (non-empty)
  const missing: string[] = [];
  for (const ch of requestedChannels) {
    if (ch === 'sms') {
      const ok = !!(templateToSend?.smsTemplate?.content && templateToSend.smsTemplate.content.trim());
      if (!ok) missing.push('SMS');
    }
    if (ch === 'email') {
      const ok = !!(templateToSend?.emailTemplate?.html && templateToSend.emailTemplate.html.trim());
      if (!ok) missing.push('Email');
    }
    if (ch === 'whatsapp') {
      const ok = !!(templateToSend?.whatsappTemplate?.content && templateToSend.whatsappTemplate.content.trim());
      if (!ok) missing.push('WhatsApp');
    }
  }

  if (missing.length > 0) {
    // Friendly error — client can show this directly
    throw new Error(
      `Missing templates: ${missing.join(', ')}. Please add templates in Template Settings or choose "Write custom messages".`
    );
  }

  // --- All good: call API ---
  try {
    const res = await fetch(`${API_URL}/users/send-message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: payload.clientId,
        type: payload.type,
        date: utcDate,
        template: templateToSend ?? payload.template, // ensure we send the augmented one
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      // prefer a friendly JSON-aware error
      const msg = await readErr(res, 'Failed to create message job');
      throw new Error(msg);
    }

    // Return response body (preserve existing behavior)
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json();
        return typeof j === 'string' ? j : JSON.stringify(j);
      }
    } catch {
      // fall through to text
    }
    return res.text();
  } catch (err: any) {
    console.error('sendMessage error:', err);
    throw new Error(err?.message || 'Failed to create message job. Please try again later.');
  }
}
