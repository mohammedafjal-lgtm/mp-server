import type { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendSuccess } from "@/utils/responseHandler";
import { setAuthCookies, clearAuthCookies } from "./utils/cookie.util";
import {
  signup as signupService,
  login as loginService,
  verifyEmail as verifyEmailService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  refresh as refreshService,
} from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  await signupService({ name, email, password });
  sendSuccess(
    res,
    { message: "Check your email for the verification code." },
    httpStatus.CREATED
  );
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginService({ email, password });
  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessExpiresInMs: result.accessExpiresInMs,
    refreshExpiresInMs: result.refreshExpiresInMs,
  });
  sendSuccess(res, { user: result.user });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await verifyEmailService({ email, otp });
  sendSuccess(res, { message: "Email verified successfully." });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = await forgotPasswordService({ email: req.body.email });
  sendSuccess(res, result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await resetPasswordService({ email, otp, newPassword });
  sendSuccess(res, { message: "Password reset successfully." });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  const result = await refreshService(token ?? "");
  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessExpiresInMs: result.accessExpiresInMs,
    refreshExpiresInMs: result.refreshExpiresInMs,
  });
  sendSuccess(res, { user: result.user });
};

export const logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  sendSuccess(res, { message: "Logged out successfully." });
};
