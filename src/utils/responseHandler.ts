import type { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "@/utils/logger";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  extra?: Record<string, unknown>
): void {
  res.status(statusCode).json({ success: false, error: message, ...extra });
}

export const responseHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, body, query, params } = req;
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error(
        `❌ Request failed: ${method} ${originalUrl}: ${JSON.stringify({
          body,
          query,
          params,
        })}`
      );
      next(err);
    });
  };