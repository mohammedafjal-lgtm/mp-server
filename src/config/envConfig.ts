import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.string().min(1),
    

    JWT_SECRET: z.string().min(1),
    JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES: z.coerce.number().default(15),
    JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().default(7),

    COOKIE_DOMAIN: z.string().optional(),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().optional(),
    
    REDIS_URL: z.string().min(1),
    REDIS_CACHE_TTL: z.coerce.number().default(300),
    RATE_LIMIT_WRITE: z.coerce.number().default(10),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV !== "production") return true;
      return data.JWT_SECRET.length >= 32;
    },
    {
      message: "JWT_SECRET must be at least 32 characters in production",
      path: ["JWT_SECRET"],
    }
  );

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}
export const env = {
  ...parsedEnv.data,
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isTest: parsedEnv.data.NODE_ENV === "test",
};
