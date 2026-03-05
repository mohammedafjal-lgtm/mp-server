import type { Request, Response, NextFunction } from "express";
import { env } from "@/config/envConfig";
import logger from "@/utils/logger";
import { AuthError } from "@/features/auth/auth.service";

function getStatusCode(err: unknown): number {
  if (err instanceof AuthError) {
    switch (err.code) {
      case "EMAIL_EXISTS":
        return 409;
      case "INVALID_CREDENTIALS":
      case "REFRESH_TOKEN_INVALID":
        return 401;
      case "INVALID_OTP":
      case "USER_NOT_FOUND":
        return 400;
      default:
        return 400;
    }
  }
  const jwtErr = err as { name?: string };
  if (
    jwtErr?.name === "JsonWebTokenError" ||
    jwtErr?.name === "TokenExpiredError"
  ) {
    return 401;
  }
  const withStatus = err as { statusCode?: number };
  if (typeof withStatus.statusCode === "number" && withStatus.statusCode >= 400) {
    return withStatus.statusCode;
  }
  return 500;
}

function getErrorMessage(err: unknown, statusCode: number): string {
  if (statusCode < 500) {
    return err instanceof Error ? err.message : "Bad request";
  }
  if (env.isProduction) {
    return "Internal server error";
  }
  return err instanceof Error ? err.message : "Internal server error";
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = getStatusCode(err);
  const message = getErrorMessage(err, statusCode);

  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled error");
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
