"use client";
import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  showToggle?: boolean; // allow disabling the eye if needed
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      hint,
      className = "",
      containerClassName = "",
      id,
      name,
      placeholder,
      required,
      autoComplete = "current-password",
      showToggle = true,
      ...props
    },
    ref
  ) => {
    const [show, setShow] = useState(false);
    const inputId = id || (typeof name === "string" ? name : undefined);
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    const base =
      "w-full rounded-full border p-2.5 pr-10 outline-none transition focus:ring-2";
    const normal =
      "border-[#3D6984]/30 focus:border-[#3D6984] focus:ring-[#3D6984]/40";
    const errored =
      "border-red-400 focus:border-red-500 focus:ring-red-300";

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 text-sm font-semibold text-[#1C2E4A]"
          >
            {label} {required ? <span className="text-red-500">*</span> : null}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={show ? "text" : "password"}
            placeholder={
              placeholder ??
              (label ? `Enter ${label.toLowerCase()}` : "Enter password")
            }
            required={required}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={`${base} ${error ? errored : normal} ${className}`}
            {...props}
          />

          {showToggle && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#1C2E4A]"
              tabIndex={0}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-[#1C2E4A]/70">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
