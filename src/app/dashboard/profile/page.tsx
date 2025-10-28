/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/profile/page.tsx
import { getTenantProfile } from "@/lib/actions/tenant";
import { getMessageTemplate } from "@/lib/actions/subscription";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import TemplateEditors from "@/components/TemplateEditors";
import { ClientQr } from "./ClientQr";
import { getCurrentUserFromToken } from "@/lib/actions/auth";

export default async function ProfilePage() {
  const [user, profile, template] = await Promise.all([
    getCurrentUserFromToken().catch(() => null),
    getTenantProfile(),
    getMessageTemplate(),
  ]);

  const name = profile?.fullName && profile.fullName !== "null" ? profile.fullName : "";
  const email = profile?.email || "";
  const phone = profile?.phoneNumber || "";
  const smsCurrent = profile?.smsCurrent ?? 0;
  const smsTotal = profile?.smsTotal ?? 0;
  const emailCurrent = profile?.emailCurrent ?? 0;
  const emailTotal = profile?.emailTotal ?? 0;
  const expiryDate = profile?.expiryDate
    ? new Date(profile.expiryDate).toLocaleDateString()
    : "No active plan";

  // prefer auth user id, then any profile fallback; coerce to string
  const userId =
    (user?.id ?? (profile as any)?.userId ?? (profile as any)?.id ?? null) &&
    String(user?.id ?? (profile as any)?.userId ?? (profile as any)?.id);

  return (
    <div className="space-y-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Your Profile</h3>
        <ClientQr userId={userId} /> {/* Button + QR modal */}
      </div>

      {/* Profile block */}
      <section className="rounded-2xl border border-[#E6EEF5] bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="User Name">
            <input className="input" defaultValue={name} disabled />
          </Field>

          <Field label="Email">
            <input type="email" className="input" defaultValue={email} disabled />
          </Field>

          <Field label="Phone Number">
            <input className="input" defaultValue={phone} disabled />
          </Field>

          <Field label="SMS Contact Counter">
            <div className="flex items-center gap-3">
              <div className="input">{smsCurrent}</div>
              <div className="text-xs text-[#7B8896]">of {smsTotal}</div>
            </div>
          </Field>

          <Field label="Email Contact Counter">
            <div className="flex items-center gap-3">
              <div className="input">{emailCurrent}</div>
              <div className="text-xs text-[#7B8896]">of {emailTotal}</div>
            </div>
          </Field>

          <Field label="Plan Expiry Date" className="md:col-span-3">
            <div className="input">{expiryDate}</div>
          </Field>
        </div>
      </section>

      {/* 📨 Template Editors (prefilled, editable) */}
      <TemplateEditors initial={template} />

      {/* 🔐 Reset Password */}
      <section>
        <h3 className="text-lg font-semibold">Reset Your Password</h3>
        <ChangePasswordForm />
      </section>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 text-[13px] font-semibold text-[#22384F]">{label}</div>
      {children}
    </div>
  );
}
