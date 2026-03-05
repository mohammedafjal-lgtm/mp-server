import type { Response } from "express";
import { env } from "@/config/envConfig";

type SetAuthCookiesParams = {
  accessToken: string;
  refreshToken: string;
  accessExpiresInMs: number;
  refreshExpiresInMs: number;
};

export function setAuthCookies(
  res: Response,
  params: SetAuthCookiesParams
): void {
  const { accessToken, refreshToken, accessExpiresInMs, refreshExpiresInMs } =
    params;

  const isProd = env.isProduction;

  const commonOptions = {
    httpOnly: true as const,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    domain: env.COOKIE_DOMAIN,
  };

  res.cookie("access_token", accessToken, {
    ...commonOptions,
    maxAge: accessExpiresInMs,
  });

  res.cookie("refresh_token", refreshToken, {
    ...commonOptions,
    maxAge: refreshExpiresInMs,
  });
}

export function clearAuthCookies(res: Response): void {
  const isProd = env.isProduction;

  const commonOptions = {
    httpOnly: true as const,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    domain: env.COOKIE_DOMAIN,
  };

  res.clearCookie("access_token", commonOptions);
  res.clearCookie("refresh_token", commonOptions);
}

