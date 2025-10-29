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
<path d="M71.498 42.9229C71.84 42.9251 70.2715 46.7093 68.0654 51.3232L64.5029 58.8027L63.9951 60H53.9424C54.1058 59.5385 55.2169 57.6456 55.4131 57.4609C55.4157 57.4585 55.42 57.4573 55.4248 57.4551C56.8431 55.097 59.6798 51.4091 61.9355 49.1533C64.9269 46.1996 69.8798 42.969 71.498 42.9229ZM106.364 29.2148C112.148 41.4016 117.221 52.1462 119.402 56.7695L119.408 56.7686L121.124 60H111.071L110.581 58.6143C110.142 57.6063 109.325 55.9105 108.375 54.0918C106.217 49.938 105.236 48.5993 102.098 45.6455C96.115 39.9687 88.906 37.1999 80.5205 37.2461C75.4697 37.2923 71.1052 38.3071 66.5938 40.5225C63.3082 42.1378 61.0034 44.0766 54.04 50.9072C50.2641 54.6918 46.8317 56.7232 41.6338 58.3848C26.8733 63.0463 10.7397 56.861 3.58008 43.8457C0.981096 39.1842 1.40351e-05 35.3537 0 30C0 24.6923 0.98105 20.861 3.58008 16.1533C10.7398 3.18455 26.873 -3.04609 41.5352 1.61523C45.5563 2.86138 49.529 4.93888 52.5693 7.33887L54.2852 8.72266L51.1465 11.6768L48.0576 14.6768L45.7529 13.0156C36.9261 6.64644 24.6169 7.06114 16.4766 14.0303C8.18917 21.0456 6.42397 32.8612 12.3574 41.5381C17.2122 48.6458 26.4806 52.6148 35.1113 51.2764C41.3392 50.3071 44.1831 48.6455 51.5879 41.584C58.7965 34.7995 61.6415 32.908 67.8203 30.8311C80.7663 26.5389 95.674 29.1233 105.678 37.3848C106.953 38.4461 107.982 39.138 107.982 38.9072C107.981 38.0753 101.803 32.1684 99.1553 30.4609L96.3604 28.6611L92.3389 20.2148C90.1324 15.5539 88.1223 11.4929 87.9258 11.123C87.4844 10.4307 86.7491 11.6773 82.6299 20.585L81.8174 22.3535L80.668 25.3848H70.6152L72.7324 20.998C73.7684 18.7432 75.1563 15.7749 76.6953 12.5537L82.6299 0H92.5352L106.364 29.2148Z" fill="url(#paint0_linear_19_592)"/>
<path d="M136.832 26.0966C134.616 26.0966 132.773 25.3555 131.305 23.8731C129.851 22.4049 129.124 20.5766 129.124 18.3884C129.124 16.1861 129.851 14.3578 131.305 12.9037C132.773 11.4214 134.616 10.6802 136.832 10.6802C138.173 10.6802 139.409 10.9978 140.538 11.6331C141.682 12.2543 142.571 13.1014 143.206 14.1743L140.686 15.6355C140.319 14.9719 139.797 14.4566 139.119 14.0896C138.442 13.7084 137.679 13.5178 136.832 13.5178C135.392 13.5178 134.228 13.9696 133.338 14.8731C132.463 15.7908 132.025 16.9625 132.025 18.3884C132.025 19.8002 132.463 20.9649 133.338 21.8825C134.228 22.7861 135.392 23.2378 136.832 23.2378C137.679 23.2378 138.442 23.0543 139.119 22.6872C139.811 22.3061 140.333 21.7908 140.686 21.1414L143.206 22.6025C142.571 23.6755 141.682 24.5296 140.538 25.1649C139.409 25.7861 138.173 26.0966 136.832 26.0966Z" fill="#1C2E4A"/>
<path d="M157.684 22.7614L159.59 24.8578L157.261 26.1919L155.905 24.7308C154.762 25.5778 153.435 26.0014 151.924 26.0014C150.413 26.0014 149.164 25.6061 148.176 24.8155C147.216 24.0108 146.736 22.9378 146.736 21.5966C146.736 20.7072 146.948 19.8955 147.371 19.1614C147.809 18.4131 148.423 17.8061 149.213 17.3402C148.733 16.5919 148.493 15.7661 148.493 14.8625C148.493 13.6061 148.931 12.5825 149.806 11.7919C150.682 10.9872 151.79 10.5849 153.131 10.5849C154.204 10.5849 155.157 10.8602 155.99 11.4108C156.823 11.9614 157.444 12.7449 157.853 13.7614L155.355 15.2014C154.959 14.0155 154.232 13.4225 153.173 13.4225C152.665 13.4225 152.242 13.5708 151.903 13.8672C151.578 14.1637 151.416 14.5378 151.416 14.9896C151.416 15.3708 151.501 15.7237 151.67 16.0484C151.853 16.359 152.171 16.7543 152.623 17.2343L155.799 20.7072C156.11 20.0719 156.35 19.2531 156.519 18.2508L158.976 19.6484C158.693 20.8061 158.263 21.8437 157.684 22.7614ZM152.115 23.3119C152.863 23.3119 153.519 23.1355 154.084 22.7825L150.886 19.3096C150.858 19.2814 150.844 19.2602 150.844 19.2461C150.068 19.7261 149.679 20.4108 149.679 21.3002C149.679 21.9214 149.891 22.4155 150.315 22.7825C150.738 23.1355 151.338 23.3119 152.115 23.3119Z" fill="#1C2E4A"/>
<path d="M177.138 25.8002H173.962L173.072 23.1319H167.164L166.275 25.8002H163.119L168.308 10.9766H171.929L177.138 25.8002ZM170.129 14.3437L168.096 20.4002H172.162L170.129 14.3437Z" fill="#1C2E4A"/>
<path d="M260.175 49.4151C258.739 49.4151 257.526 49.0945 256.537 48.4532C255.547 47.8119 254.843 46.9267 254.424 45.7975L256.892 44.3547C257.464 45.8463 258.586 46.5921 260.259 46.5921C261.039 46.5921 261.625 46.4527 262.015 46.1739C262.406 45.8951 262.601 45.5187 262.601 45.0447C262.601 44.5289 262.371 44.1316 261.911 43.8528C261.451 43.5601 260.628 43.2464 259.443 42.9118C258.161 42.5215 257.15 42.0684 256.411 41.5526C255.491 40.8695 255.031 39.8658 255.031 38.5414C255.031 37.2031 255.498 36.1506 256.432 35.3839C257.366 34.5892 258.502 34.1919 259.84 34.1919C261.011 34.1919 262.05 34.4777 262.956 35.0493C263.862 35.6209 264.566 36.4294 265.068 37.475L262.643 38.876C262.057 37.6213 261.123 36.994 259.84 36.994C259.255 36.994 258.788 37.1334 258.439 37.4122C258.091 37.6771 257.917 38.0256 257.917 38.4578C257.917 38.9178 258.105 39.2942 258.481 39.587C258.899 39.8797 259.638 40.1864 260.698 40.5071L261.702 40.8416C261.883 40.8974 262.196 41.0159 262.643 41.1971C263.061 41.3505 263.367 41.4968 263.563 41.6362C264.246 42.0545 264.706 42.4866 264.943 42.9327C265.305 43.5182 265.486 44.2083 265.486 45.0029C265.486 46.3551 264.992 47.4286 264.002 48.2232C263.012 49.0178 261.736 49.4151 260.175 49.4151Z" fill="#1C2E4A"/>
<path d="M247.857 43.4137V34.4847H250.743V49.1224H248.547L242.274 40.1725V49.1224H239.388V34.4847H241.584L247.857 43.4137Z" fill="#1C2E4A"/>
<path d="M233.44 47.2195C231.962 48.6832 230.164 49.4151 228.045 49.4151C225.926 49.4151 224.128 48.6832 222.65 47.2195C221.186 45.7278 220.454 43.9225 220.454 41.8035C220.454 39.6706 221.186 37.8723 222.65 36.4085C224.128 34.9308 225.926 34.1919 228.045 34.1919C230.164 34.1919 231.962 34.9308 233.44 36.4085C234.918 37.8723 235.656 39.6706 235.656 41.8035C235.656 43.9364 234.918 45.7418 233.44 47.2195ZM224.678 45.2538C225.57 46.146 226.693 46.5921 228.045 46.5921C229.397 46.5921 230.519 46.146 231.412 45.2538C232.318 44.3477 232.771 43.1976 232.771 41.8035C232.771 40.4095 232.318 39.2594 231.412 38.3532C230.505 37.4471 229.383 36.994 228.045 36.994C226.707 36.994 225.584 37.4471 224.678 38.3532C223.772 39.2594 223.319 40.4095 223.319 41.8035C223.319 43.1976 223.772 44.3477 224.678 45.2538Z" fill="#1C2E4A"/>
<path d="M213.771 49.1224V34.4847H216.657V49.1224H213.771Z" fill="#1C2E4A"/>
<path d="M199.292 34.4847H210.061V37.245H206.109V49.1224H203.223V37.245H199.292V34.4847Z" fill="#1C2E4A"/>
<path d="M192.725 43.4137V34.4847H195.611V49.1224H193.415L187.142 40.1725V49.1224H184.256V34.4847H186.452L192.725 43.4137Z" fill="#1C2E4A"/>
<path d="M174.333 43.0792V46.3622H180.502V49.1224H171.448V34.4847H180.398V37.245H174.333V40.3607H179.875V43.0792H174.333Z" fill="#1C2E4A"/>
<path d="M156.968 34.4847H167.738V37.245H163.785V49.1224H160.9V37.245H156.968V34.4847Z" fill="#1C2E4A"/>
<path d="M147.046 43.0792V46.3622H153.215V49.1224H144.16V34.4847H153.11V37.245H147.046V40.3607H152.587V43.0792H147.046Z" fill="#1C2E4A"/>
<path d="M140.27 49.1224H137.154L134.205 44.0411H132.01V49.1224H129.124V34.4847H134.979C136.331 34.4847 137.481 34.9587 138.429 35.9067C139.377 36.8547 139.851 37.9978 139.851 39.3361C139.851 40.2422 139.593 41.0856 139.078 41.8663C138.562 42.6331 137.879 43.2116 137.028 43.6019L140.27 49.1224ZM134.979 37.1823H132.01V41.5108H134.979C135.523 41.5108 135.99 41.3017 136.38 40.8835C136.77 40.4513 136.966 39.9355 136.966 39.3361C136.966 38.7366 136.77 38.2278 136.38 37.8096C135.99 37.3914 135.523 37.1823 134.979 37.1823Z" fill="#1C2E4A"/>
<defs>
<linearGradient id="paint0_linear_19_592" x1="60.562" y1="0" x2="60.562" y2="60" gradientUnits="userSpaceOnUse">
<stop stop-color="#3D6984"/>
<stop offset="1" stop-color="#1C2E4A"/>
</linearGradient>
</defs>
</svg>
  </div>
  <div style="font-size:14px;font-weight:600;color:#1C2E4A;">
    Communication Provider <span style="color:#3D6984;">C&A Retention</span>
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
