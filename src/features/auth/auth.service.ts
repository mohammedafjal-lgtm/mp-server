import crypto from "crypto";
import { pool } from "@/config/database";
import { redis } from "@/config/redis";
import { env } from "@/config/envConfig";
import { hashPassword, verifyPassword } from "./utils/password.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./utils/jwt.util";
import {
  generateOtp,
  getOtpKey,
  setOtp,
  getOtp,
  deleteOtp,
} from "./utils/otp.util";
import {
  sendVerifyEmail,
  sendResetPasswordEmail,
} from "@/services/email.service";
import type { UserResponse } from "./auth.types";
import type {
  SignupInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.validation";

const ACCESS_EXPIRES_MS =
  env.JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES * 60 * 1000;
const REFRESH_EXPIRES_MS =
  env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function toUserResponse(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
}): UserResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as "buyer" | "seller",
    emailVerified: row.email_verified,
  };
}

export type LoginResult = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  accessExpiresInMs: number;
  refreshExpiresInMs: number;
};

export async function signup(input: SignupInput): Promise<void> {
  const emailLower = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const existing = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
    [input.email]
  );
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, email_verified)
     VALUES ($1, $2, $3, false)`,
    [name, emailLower, passwordHash]
  );

  const otp = generateOtp();
  const key = getOtpKey("verify", emailLower);
  await setOtp(redis, key, otp);
  await sendVerifyEmail({ to: emailLower, otp, name });
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const emailLower = input.email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, name, email, password_hash, role, email_verified FROM users WHERE LOWER(email) = $1",
    [emailLower]
  );
  const user = result.rows[0];
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    throw new Error("Invalid email or password");
  }

  const tokenId = crypto.randomUUID();
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    emailVerified: user.email_verified,
  });
  const refreshToken = signRefreshToken({ userId: user.id, tokenId });
  const refreshHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, refreshHash, expiresAt]
  );

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
    accessExpiresInMs: ACCESS_EXPIRES_MS,
    refreshExpiresInMs: REFRESH_EXPIRES_MS,
  };
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  const emailLower = input.email.trim().toLowerCase();
  const key = getOtpKey("verify", emailLower);

  const storedOtp = await getOtp(redis, key);
  if (!storedOtp || storedOtp !== input.otp) {
    throw new Error("Invalid or expired verification code");
  }

  const result = await pool.query(
    "UPDATE users SET email_verified = true, updated_at = NOW() WHERE LOWER(email) = $1 RETURNING id",
    [emailLower]
  );
  if (result.rowCount === 0) {
    throw new Error("User not found");
  }
  await deleteOtp(redis, key);
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ message: string }> {
  const emailLower = input.email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, name FROM users WHERE LOWER(email) = $1",
    [emailLower]
  );
  const user = result.rows[0];
  if (user) {
    const otp = generateOtp();
    const key = getOtpKey("reset", emailLower);
    await setOtp(redis, key, otp);
    await sendResetPasswordEmail({
      to: emailLower,
      otp,
      name: user.name,
    });
  }

  return {
    message:
      "If an account exists with this email, you will receive a password reset code.",
  };
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<void> {
  const emailLower = input.email.trim().toLowerCase();
  const key = getOtpKey("reset", emailLower);

  const storedOtp = await getOtp(redis, key);
  if (!storedOtp || storedOtp !== input.otp) {
    throw new Error("Invalid or expired reset code");
  }

  const passwordHash = await hashPassword(input.newPassword);
  const result = await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2 RETURNING id",
    [passwordHash, emailLower]
  );
  if (result.rowCount === 0) {
    throw new Error("User not found");
  }
  await deleteOtp(redis, key);
}

export async function refresh(refreshToken: string): Promise<LoginResult> {
  if (!refreshToken?.trim()) {
    throw new Error("Refresh token required");
  }
  // Will throw if the token is invalid or expired; handled by errorHandler
  verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);
  const tokenRow = await pool.query(
    `SELECT rt.user_id, u.name, u.email, u.role, u.email_verified
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
    [tokenHash]
  );
  if (tokenRow.rows.length === 0) {
        throw new Error("Invalid or expired refresh token");
  }
  const row = tokenRow.rows[0];

  const accessToken = signAccessToken({
    userId: row.user_id,
    role: row.role,
    emailVerified: row.email_verified,
  });

  return {
    user: toUserResponse({
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      email_verified: row.email_verified,
    }),
    accessToken,
    refreshToken,
    accessExpiresInMs: ACCESS_EXPIRES_MS,
    refreshExpiresInMs: REFRESH_EXPIRES_MS,
  };
}
