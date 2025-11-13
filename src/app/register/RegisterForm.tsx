"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "@/lib/actions/auth";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/ui/PasswordInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" loading={pending}>
      {pending ? "Creating account…" : "Create account"}
    </PrimaryButton>
  );
}

export default function RegisterForm() {
  const [phone, setPhone] = useState("");

  // ✅ Remove spaces and dashes before sending
  const normalizedPhone = phone.replace(/\s|-/g, "");

  return (
    <form action={signup} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name spans both columns */}
        <div className="md:col-span-2">
          <FormInput
            name="fullName"
            label="Full Name"
            autoComplete="name"
          />
        </div>

        {/* ✅ International Phone Input */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Phone Number
          </label>

          <PhoneInput
            defaultCountry="lb"  // 🇱🇧 Lebanon by default
            value={phone}
            onChange={setPhone}
            inputClassName="
              w-full
              border border-gray-300 
              rounded-md 
              px-3 py-2 
              focus:ring-2 
              focus:ring-blue-500 
              focus:outline-none
            "
            countrySelectorStyleProps={{
              buttonClassName:
                "border border-gray-300 rounded-l-md px-3 py-2 bg-white",
            }}
          />

          {/* ✅ Hidden input (no spaces) */}
          <input type="hidden" name="phoneNumber" value={normalizedPhone} />
        </div>

        <FormInput
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
        />

        <PasswordInput
          name="password"
          label="Password"
          autoComplete="new-password"
          required
        />
        <PasswordInput
          name="confirmPassword"
          label="Confirm Password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="mt-4">
        <Submit />
      </div>

      <p className="mt-4 text-center text-sm text-[#1C2E4A]/70">
        Already have an account?{" "}
        <a
          href="/login"
          className="underline hover:text-[#3D6984]"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
