"use client";
import React, { forwardRef, InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
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
      ...props
    },
    ref
  ) => {
    const inputId = id || (typeof name === "string" ? name : undefined);
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    const base =
      "w-full rounded-full border p-2.5 outline-none transition focus:ring-2";
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

        <input
          ref={ref}
          id={inputId}
          name={name}
          placeholder={
            placeholder ??
            (label ? `Enter ${label.toLowerCase()}` : undefined)
          }
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`${base} ${error ? errored : normal} ${className}`}
          {...props}
        />

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

FormInput.displayName = "FormInput";
export default FormInput;
