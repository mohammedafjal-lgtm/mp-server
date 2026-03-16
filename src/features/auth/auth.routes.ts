import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "@/config/zodOpenApi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
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
import { StatusCodes } from "http-status-codes";

export const authRegistry = new OpenAPIRegistry();
export const authRoutes = Router();

const messageResponse = z.object({ message: z.string() });
const userResponse = z.object({ user: z.record(z.string(), z.unknown()) });

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/signup",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: signupSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(messageResponse, "Signup successful", StatusCodes.CREATED),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(userResponse, "Login successful"),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/verify-email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: verifyEmailSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(messageResponse, "Email verified successfully"),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/forgot-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: forgotPasswordSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(messageResponse, "Forgot password email sent"),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/reset-password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(messageResponse, "Password reset successfully"),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/refresh",
  tags: ["Auth"],
  responses: createApiResponse(userResponse, "Token refreshed"),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/logout",
  tags: ["Auth"],
  responses: createApiResponse(messageResponse, "Logged out successfully"),
});

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
