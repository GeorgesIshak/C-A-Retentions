"use client";

import { useFormStatus } from "react-dom";
import { resetPassword, resendOtp } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/ui/PasswordInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Resetting..." : "Reset Password"}
    </PrimaryButton>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      formAction={resendOtp}
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1 underline text-sm text-[#1C2E4A]/70 hover:text-[#3D6984] disabled:opacity-50"
    >
      {pending ? "Resending..." : "Resend OTP"}
    </button>
  );
}

export default function ResetForm({ email }: { email: string }) {
  return (
    <form action={resetPassword} noValidate className="space-y-5">
      {/* Email */}
      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        defaultValue={email}
        required
        autoComplete="email"
      />

      <div className="mt-1 text-xs text-[#6B7C8F]">
        Not your email?{" "}
        <a
          href={`/forgot${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="underline hover:text-[#3D6984] text-[#1C2E4A]/70"
        >
          Use a different one
        </a>
        .
      </div>

      {/* OTP */}
      <FormInput
        name="otp"
        type="text"
        label="OTP Code"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="• • • • • •"
        maxLength={6}
        pattern="[0-9]{6}"
        required
      />

      {/* New Password */}
      <PasswordInput
        name="newPassword"
        label="New Password"
        autoComplete="new-password"
        placeholder="Create a strong password"
        required
      />

      <ResetButton />

      <div className="mt-6 flex items-center justify-between text-sm">
        <a href="/login" className="underline text-[#1C2E4A]/70 hover:text-[#3D6984]">
          Back to sign in
        </a>
        <div className="text-right">
          <span className="mr-2 text-[#6B7C8F]">Didn’t get the code?</span>
          <ResendButton />
        </div>
      </div>
    </form>
  );
}
