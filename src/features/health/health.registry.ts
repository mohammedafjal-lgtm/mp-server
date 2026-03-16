import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";

export const healthRegistry = new OpenAPIRegistry();

healthRegistry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: createApiResponse(z.null(), "Service health check"),
});
