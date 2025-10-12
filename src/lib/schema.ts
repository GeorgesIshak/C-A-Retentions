// lib/schema.ts
import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'Password too weak',
  });

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: strongPassword,
});

const otp6 = z
  .string()
  .length(6, { message: 'OTP must be 6 digits' })
  .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' });

export const verifyEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  otp: otp6,
});

/** NEW: forgot / resend / reset */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const resendOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  otp: otp6,
  newPassword: strongPassword,
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResendOtpSchema = z.infer<typeof resendOtpSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
