import jwt from "jsonwebtoken";
import { env } from "@/config/envConfig";

export type AccessTokenPayload = {
  userId: string;
  role: "buyer" | "seller";
  emailVerified: boolean;
};

export type RefreshTokenPayload = {
  userId: string;
  tokenId: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES}m`,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS}d`,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid access token payload");
  }
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid refresh token payload");
  }
  return decoded as RefreshTokenPayload;
}

