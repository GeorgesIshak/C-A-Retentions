/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/profile/page.tsx
import { getTenantProfile, updateTenantProfile } from "@/lib/actions/tenant";
import { getMessageTemplate } from "@/lib/actions/subscription";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import TemplateEditors from "@/components/TemplateEditors";
import { ClientQr } from "./ClientQr";
import { getCurrentUserFromToken } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";

/* ----------------------- server action: update ----------------------- */
export async function updateProfileAction(formData: FormData) {
  "use server";
  const fullName = (formData.get("fullName") as string | null) ?? undefined;
  const businessName = (formData.get("businessName") as string | null) ?? undefined;
  const phoneNumber = (formData.get("phoneNumber") as string | null) ?? undefined;

  // Only send fields that exist (backend accepts any subset of these)
  const payload: Record<string, string> = {};
  if (typeof fullName === "string") payload.fullName = fullName.trim();
  if (typeof businessName === "string") payload.businessName = businessName.trim();
  if (typeof phoneNumber === "string") payload.phoneNumber = phoneNumber.trim();

  await updateTenantProfile(payload);
  revalidatePath("/dashboard/profile");
}

export default async function ProfilePage() {
  const [user, profile, template] = await Promise.all([
    getCurrentUserFromToken().catch(() => null),
    getTenantProfile(),
    getMessageTemplate(),
  ]);

  const name =
    profile?.fullName && profile.fullName !== "null" ? profile.fullName : "";
  const email = profile?.email || "";
  const phone = profile?.phoneNumber || "";
  const businessName = profile?.businessName || "";

  const smsCurrent = profile?.smsCurrent ?? 0;
  const smsTotal = profile?.smsTotal ?? 0;
  const emailCurrent = profile?.emailCurrent ?? 0;
  const emailTotal = profile?.emailTotal ?? 0;
  const expiryDate = profile?.expiryDate
    ? new Date(profile.expiryDate).toLocaleDateString()
    : "No active plan";

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

      {/* Profile block (editable form) */}
      <section className="rounded-2xl border border-[#E6EEF5] bg-white p-5">
        <form action={updateProfileAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Name (editable) */}
            <Field label="Business Name">
              <input
                name="businessName"
                className="input"
                defaultValue={businessName}
                placeholder="Your business name"
              />
            </Field>

            {/* User Name (editable) */}
            <Field label="User Name">
              <input
                name="fullName"
                className="input"
                defaultValue={name}
                placeholder="Your name"
              />
            </Field>

            {/* Email (read-only; backend doesn't update via this route) */}
            <Field label="Email">
              <input
                type="email"
                className="input"
                defaultValue={email}
                disabled
              />
            </Field>

            {/* Phone Number (editable) */}
            <Field label="Phone Number">
              <input
                name="phoneNumber"
                className="input"
                defaultValue={phone}
                placeholder="+961..."
              />
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

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] text-sm px-6 py-2.5  text-white font-medium hover:opacity-95 transition"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* 📨 Template Editors */}
      <section>
                <h3 className="text-lg font-semibold mb-5">Edit Your Templates</h3>
                    <TemplateEditors initial={template} />

      </section>
  

      {/* 🔐 Reset Password */}
      <section>
        <h3 className="text-lg font-semibold mb-5">Reset Your Password</h3>
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
