/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.BACKEND_API_URL!;
if (!API_URL) throw new Error('BACKEND_API_URL is not defined');

// ---------------------------------------
// Check if user has an active plan
// ---------------------------------------
export async function hasActivePlan(): Promise<boolean> {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) return false;

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
// (send only the parts you want to update)
// ---------------------------------------
export async function updateMessageTemplate(input: {
  smsTemplate?: Partial<SmsTemplate> | null;
  emailTemplate?: Partial<EmailTemplate> | null;
}): Promise<MessageTemplate> {
  const body: Record<string, unknown> = {};
  if (input.smsTemplate) body.smsTemplate = { content: input.smsTemplate.content ?? '' };
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
// type: "send-message" | "send-email"
// date: Date or ISO string (UTC will be sent)
// ---------------------------------------
export type FrontendMessageType = 'send-message' | 'send-email';
export async function sendMessage(payload: {
  clientId: string;
  type: FrontendMessageType;
  date?: Date | string;
}) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('No access token found');

  const utcDate =
    payload.date instanceof Date
      ? payload.date.toISOString()
      : payload.date
      ? new Date(payload.date).toISOString()
      : undefined;

  const res = await fetch(`${API_URL}/users/send-message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: payload.clientId,
      type: payload.type, // "send-message" (SMS) | "send-email" (Email)
      date: utcDate,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to create message job');
  }

  // Backend returns plain text (201 Created), return it for UI toast
  return res.text();
}
