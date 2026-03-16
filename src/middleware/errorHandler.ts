// backend/src/middleware/errorHandler.ts
import type { ErrorRequestHandler } from "express";
import logger from "@/utils/logger";
import { env } from "@/config/envConfig";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const e = err as { statusCode?: number; message?: string; stack?: string };


if(env.isDevelopment) {
  logger.error(err.stack);
} else {
  logger.error(e.message);
}
  res.status(e.statusCode || 500).json({
    success: false,
    error: e.message || "Internal server error",
  });
};