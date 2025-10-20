// app/admin-login/AdminLoginForm.tsx
"use client";

import { useFormStatus } from "react-dom";
import { loginAdmin } from "@/lib/actions/auth-admin";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/ui/PasswordInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Signing in…" : "Sign In"}
    </PrimaryButton>
  );
}

export default function AdminLoginForm({ nextUrl }: { nextUrl: string }) {
  return (
    <form action={loginAdmin} className="space-y-5">
      {/* preserve intended redirect */}
      <input type="hidden" name="next" value={nextUrl} />

      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Enter email"
        autoComplete="email"
        required
      />

      <PasswordInput
        name="password"
        label="Password"
        placeholder="Enter password"
        autoComplete="current-password"
        required
      />

      <SubmitButton />
    </form>
  );
}
