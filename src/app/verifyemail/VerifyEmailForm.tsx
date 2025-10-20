"use client";

import { useFormStatus } from "react-dom";
import { verifyEmail } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Verifying…" : "Verify Email"}
    </PrimaryButton>
  );
}

export default function VerifyEmailForm({ email }: { email: string }) {
  return (
    <form action={verifyEmail} noValidate>
      <FormInput
        name="email"
        type="email"
        label="Email"
        value={email}
        readOnly
        className="bg-gray-100 cursor-not-allowed text-gray-600"
      />

      <div className="mt-4">
        <label className="block mb-1 text-sm font-semibold text-[#1C2E4A]">OTP Code</label>
        <input
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          pattern="[0-9]{6}"
          required
          className="mt-1 w-full text-center tracking-widest rounded-full border border-[#3D6984]/30 bg-white p-2.5 text-[15px] outline-none focus:border-[#3D6984] focus:ring-2 focus:ring-[#3D6984]/40 transition"
        />
        <p className="mt-1 text-xs text-[#1C2E4A]/70">Enter the 6-digit code we sent to your email.</p>
      </div>

      <div className="mt-4">
        <SubmitBtn />
      </div>

      <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
        Didn’t get a code?{" "}
        <a href={`/resend?email=${encodeURIComponent(email)}`} className="underline hover:text-[#3D6984]">Resend</a>
      </p>

      <p className="mt-2 text-center text-sm text-[#1C2E4A]/70">
        Already verified? <a href="/login" className="underline hover:text-[#3D6984]">Sign in</a>
      </p>
    </form>
  );
}
