import { StatusCodes } from "http-status-codes";
import { z } from "zod";

/** Wraps schema in MarketPlace API response shape: { success: true, data } */
function apiResponseSchema(schema: z.ZodTypeAny) {
  return z.object({
    success: z.literal(true),
    data: schema,
  });
}

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  statusCode = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: apiResponseSchema(schema),
        },
      },
    },
  };
}
