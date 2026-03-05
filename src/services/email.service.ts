import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { Resend } from "resend";
import { env } from "@/config/envConfig";
import logger from "@/utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(env.RESEND_API_KEY);
const from = env.EMAIL_FROM ?? "Marketplace <onboarding@resend.dev>";

const templatesDir = path.resolve(__dirname, "../templates");

function loadTemplate(name: string): Handlebars.TemplateDelegate {
  const filePath = path.join(templatesDir, `${name}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8");
  return Handlebars.compile(source);
}

const verifyEmailTemplate = loadTemplate("verify-email");
const resetPasswordTemplate = loadTemplate("reset-password");

export type SendVerifyEmailParams = {
  to: string;
  otp: string;
  name?: string;
};

export type SendResetPasswordParams = {
  to: string;
  otp: string;
  name?: string;
};

export async function sendVerifyEmail(params: SendVerifyEmailParams): Promise<void> {
  const html = verifyEmailTemplate({ otp: params.otp, name: params.name });
  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject: "Verify your email - Marketplace",
    html,
  });
  if (error) {
    logger.error({ err: error }, "Failed to send verify email");
    throw new Error("Failed to send verification email");
  }
  logger.info({ id: data?.id, to: params.to }, "Verify email sent");
}

export async function sendResetPasswordEmail(params: SendResetPasswordParams): Promise<void> {
  const html = resetPasswordTemplate({ otp: params.otp, name: params.name });
  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject: "Reset your password - Marketplace",
    html,
  });
  if (error) {
    logger.error({ err: error }, "Failed to send reset password email");
    throw new Error("Failed to send reset password email");
  }
  logger.info({ id: data?.id, to: params.to }, "Reset password email sent");
}
