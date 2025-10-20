"use client";

import { useFormStatus } from "react-dom";
import { signup } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/ui/PasswordInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Creating account…" : "Create account"}
    </PrimaryButton>
  );
}

export default function RegisterForm() {
  return (
    <form action={signup} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name spans both columns */}
        <div className="md:col-span-2">
          <FormInput name="fullName" label="Full Name" autoComplete="name" />
        </div>

        <FormInput name="phoneNumber" label="Phone Number" placeholder="+1234567890" autoComplete="tel" />
        <FormInput name="email" type="email" label="Email" autoComplete="email" required />

        <PasswordInput name="password" label="Password" autoComplete="new-password" required />
        <PasswordInput name="confirmPassword" label="Confirm Password" autoComplete="new-password" required />
      </div>

      <div className="mt-4">
        <Submit />
      </div>

      <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
        Already have an account? <a href="/login" className="underline hover:text-[#3D6984]">Sign in</a>
      </p>
    </form>
  );
}
