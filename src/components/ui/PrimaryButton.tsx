"use client";
import { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function PrimaryButton({
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`mt-6 w-full rounded-full bg-gradient-to-b from-[#3D6984] to-[#1C2E4A] px-4 py-3 text-white disabled:opacity-60 ${className}`}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
