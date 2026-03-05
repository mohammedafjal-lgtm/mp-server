import { z } from "zod";

const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must be 6 digits");

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: otpSchema,
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
