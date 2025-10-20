"use client";

import { useFormStatus } from "react-dom";
import { login } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/ui/PasswordInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Signing in…" : "Sign In"}
    </PrimaryButton>
  );
}

export default function LoginForm({ nextUrl }: { nextUrl: string }) {
  return (
    <form action={login} className="space-y-4">
      <input type="hidden" name="next" value={nextUrl} />
      <FormInput name="email" type="email" label="Email" autoComplete="email" required />
      <PasswordInput name="password" label="Password" autoComplete="current-password" required />
      <div className="text-right">
        <a href="/forgot" className="text-sm text-[#1C2E4A]/70 hover:text-[#3D6984] underline">
          Forgot password?
        </a>
      </div>
      <Submit />
      <p className="text-center text-sm text-[#1C2E4A]/70">
        Don’t have an account? <a href="/register" className="underline hover:text-[#3D6984]">Create one</a>
      </p>
    </form>
  );
}
