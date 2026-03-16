import { z } from "@/config/zodOpenApi";

const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must be 6 digits");

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    otp: otpSchema,
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    otp: otpSchema,
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
