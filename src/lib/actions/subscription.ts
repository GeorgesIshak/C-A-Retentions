/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';

// Mark + footer HTML
const BRAND_FOOTER_MARK = '<!-- BRAND_FOOTER -->';
const BRAND_FOOTER_HTML = `
${BRAND_FOOTER_MARK}
<hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
<div style="text-align:center;font-family:'Segoe UI',Arial,sans-serif;">
  <img
    src="https://c-a-retentions.vercel.app/images/logo.svg"
    alt="C&A Retentions"
    width="90"
    style="display:block;margin:0 auto 6px;object-fit:contain;"
  />
  <div style="font-size:14px;font-weight:600;color:#1C2E4A;">
    Communication Provider <span style="color:#3D6984;">C&A Retentions</span>
  </div>
</div>
`;

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

  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return false;

  const p: any = await res.json().catch(() => ({}));
  const expiry = p?.expiryDate ? new Date(p.expiryDate) : null;
  return !!expiry && expiry.getTime() > Date.now();
}

// ---------------------------------------
// Message Template: types
// ---------------------------------------
export type SmsTemplate = { content: string };
export type EmailTemplate = { subject: string; html: string };
export type MessageTemplate = {
  id?: string;
  smsTemplate?: SmsTemplate | null;
  emailTemplate?: EmailTemplate | null;
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
  const res = await fetch(`${API_URL}/users/message-template`, {
    method: 'GET',
    headers: await authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to load message template');
  }
  return res.json();
}

// ---------------------------------------
// PUT /users/message-template
// ---------------------------------------
export async function updateMessageTemplate(input: {
  smsTemplate?: Partial<SmsTemplate> | null;
  emailTemplate?: Partial<EmailTemplate> | null;
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

  const res = await fetch(`${API_URL}/users/message-template`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to update message template');
  }
  return res.json();
}

// ---------------------------------------
// POST /users/send-message  (schedule SMS/Email)
// ---------------------------------------
export type FrontendMessageType = 'send-message' | 'send-email';

export async function sendMessage(payload: {
  clientId: string;
  type: FrontendMessageType; // 'send-message' | 'send-email'
  date?: Date | string;
  /** optional: override default template on this send */
  template?: {
    smsTemplate?: SmsTemplate;
    emailTemplate?: EmailTemplate;
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

  // 📨 Append brand footer for EMAILS ONLY (handles custom + saved template)
  let templateToSend = payload.template;

  if (payload.type === 'send-email') {
    if (templateToSend?.emailTemplate?.html) {
      // Custom HTML passed from frontend → append footer here
      templateToSend = {
        ...templateToSend,
        emailTemplate: {
          subject: templateToSend.emailTemplate.subject ?? '',
          html: withBrandFooter(templateToSend.emailTemplate.html),
        },
      };
    } else {
      // No custom HTML passed → pull saved template and append
      try {
        const saved = await getMessageTemplate().catch(() => null);
        const savedEmail = saved?.emailTemplate;
        if (savedEmail?.html) {
          templateToSend = {
            ...(templateToSend ?? {}),
            emailTemplate: {
              subject: savedEmail.subject ?? '',
              html: withBrandFooter(savedEmail.html),
            },
          };
        }
        // if no saved email exists, we let backend default stand
      } catch {
        // ignore; fallback to backend default
      }
    }
  }

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
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to create message job');
  }

  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      return typeof j === 'string' ? j : JSON.stringify(j);
    }
  } catch {}
  return res.text();
}
