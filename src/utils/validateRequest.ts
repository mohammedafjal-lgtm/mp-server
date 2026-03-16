import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { sendError } from "./responseHandler";

type RequestParts = {
  body?: Request["body"];
  query?: Request["query"];
  params?: Request["params"];
};

export function validateRequest<T extends z.ZodType<RequestParts>>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Merge all sources into one object for validation
    const toValidate = {
      body: req.body,
      query: req.query,
      params: req.params
    };
    
    const result = schema.safeParse(toValidate);
    if (result.success) {
      // Optionally overwrite each part with the validated data
      const { body, query, params } = result.data;
      if (body !== undefined) {
        req.body = body as typeof req.body;
      }
      if (query !== undefined) {
        req.query = query as typeof req.query;
      }
      if (params !== undefined) {
        req.params = params as typeof req.params;
      }
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