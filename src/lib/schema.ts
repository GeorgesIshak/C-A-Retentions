// lib/schema.ts
import { z } from "zod";

/* ----------------------------- Common atoms ----------------------------- */

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Invalid email address" });

const otp6 = z
  .string()
  .trim()
  .length(6, { message: "OTP must be 6 digits" })
  .regex(/^\d{6}$/, { message: "OTP must be 6 digits" });

const strongPassword = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  // ✅ single backslashes in regex literal
  .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: "Password too weak",
  })
  .refine((v) => !/\s/.test(v), { message: "Password cannot contain spaces" });

/** Treat "", "null", null, undefined as “missing” */
const normalizeOptional = (v?: string | null) => {
  if (v == null) return undefined;
  const t = v.trim();
  if (!t || t.toLowerCase() === "null") return undefined;
  return t;
};

const fullNameSchema = z
  .string()
  .transform(normalizeOptional)
  .optional()
  .refine((val) => (val ? val.length <= 80 : true), {
    message: "Full name is too long",
  });

/** Basic E.164 phone (8–15 digits, optional +) */
const phoneSchema = z
  .string()
  .transform(normalizeOptional)
  .optional()
  // ✅ single backslashes here too
  .refine((val) => (val ? /^\+?[1-9]\d{7,14}$/.test(val) : true), {
    message: "Invalid phone number",
  });

/* ------------------------------- Auth flows ------------------------------ */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

/**
 * UI Signup schema (form) — includes confirmPassword and cross-field checks.
 * Use this in your client form validation.
 */
export const signupFormSchema = z
  .object({
    email: emailSchema,
    password: strongPassword,
    confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
    fullName: fullNameSchema,      // optional
    phoneNumber: phoneSchema,      // optional
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

/**
 * Server payload schema (no confirmPassword).
 * Use this in your server action before POSTing to /auth/signup.
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: strongPassword,
  fullName: fullNameSchema,   // optional → undefined if blank/"null"
  phoneNumber: phoneSchema,   // optional → undefined if blank/"null"
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: otp6,
});

/** Forgot / Resend / Reset */
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resendOtpSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otp6,
  newPassword: strongPassword,
});

/* -------------------------- Change password pair ------------------------- */

const changePasswordBase = z.object({
  currentPassword: z.string().min(8, { message: "Current password is required" }),
  newPassword: strongPassword,
});

/** Server payload schema (checks: new != current) */
export const changePasswordSchema = changePasswordBase.refine(
  (v) => v.currentPassword !== v.newPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }
);

/** UI form schema (adds confirm + both checks) */
export const changePasswordFormSchema = changePasswordBase
  .extend({
    confirmNewPassword: z.string().min(8, { message: "Please confirm your new password" }),
  })
  .superRefine((v, ctx) => {
    if (v.currentPassword === v.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "New password must be different from current password",
      });
    }
    if (v.newPassword !== v.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Passwords do not match",
      });
    }
  });

/* --------------------------------- Types --------------------------------- */

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupFormSchema = z.infer<typeof signupFormSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResendOtpSchema = z.infer<typeof resendOtpSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>;
