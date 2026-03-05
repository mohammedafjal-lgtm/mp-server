import { Router } from "express";
import { validateRequest } from "@/utils/validateRequest";
import { responseHandler } from "@/utils/responseHandler";
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
} from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/signup", validateRequest(signupSchema), responseHandler(signup));
authRoutes.post("/login", validateRequest(loginSchema), responseHandler(login));
authRoutes.post("/verify-email", validateRequest(verifyEmailSchema), responseHandler(verifyEmail));
authRoutes.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  responseHandler(forgotPassword)
);
authRoutes.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  responseHandler(resetPassword)
);
authRoutes.post("/refresh", responseHandler(refresh));
authRoutes.post("/logout", responseHandler(logout));
