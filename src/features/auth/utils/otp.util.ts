import type Redis from "ioredis";

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 600; // 10 minutes

export function generateOtp(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function getOtpKey(type: "verify" | "reset", email: string): string {
  return `otp:${type}:${email.toLowerCase()}`;
}

export async function setOtp(
  redis: Redis,
  key: string,
  otp: string,
  ttlSeconds: number = OTP_TTL_SECONDS
): Promise<void> {
  await redis.setex(key, ttlSeconds, otp);
}

export async function getOtp(redis: Redis, key: string): Promise<string | null> {
  return redis.get(key);
}

export async function deleteOtp(redis: Redis, key: string): Promise<void> {
  await redis.del(key);
}
