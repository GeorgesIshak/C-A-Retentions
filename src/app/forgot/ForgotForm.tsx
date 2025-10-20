"use client";

import { useFormStatus } from "react-dom";
import { forgotPassword } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Sending…" : "Send OTP"}
    </PrimaryButton>
  );
}

export default function ForgotForm({ prefillEmail }: { prefillEmail: string }) {
  return (
    <form action={forgotPassword} noValidate className="space-y-4">
      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your account email"
        defaultValue={prefillEmail}
        required
        autoComplete="email"
      />

      <Submit />

      <p className="text-center text-sm text-[#1C2E4A]/70">
        Remembered your password?{" "}
        <a href="/login" className="underline hover:text-[#3D6984]">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
