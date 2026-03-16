import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { healthRegistry } from "@/features/health/health.registry";
import { authRegistry } from "@/features/auth/auth.routes";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
  const registry = new OpenAPIRegistry([healthRegistry, authRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "MarketPlace API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/docs/swagger.json",
    },
  });
}
