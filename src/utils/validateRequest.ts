import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { sendError } from "./responseHandler";

type Source = "body" | "query" | "params";

export function validateRequest<T extends z.ZodType>(
  schema: T,
  source: Source = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (result.success) {
      req[source] = result.data;
      next();
    } else {
      const formatted = result.error.flatten();
      sendError(
        res,
        formatted.formErrors?.[0] ?? "Validation failed",
        400,
        { errors: formatted.fieldErrors }
      );
    }
  };
}
