export type SignupBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyEmailBody = {
  email: string;
  otp: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ResetPasswordBody = {
  email: string;
  otp: string;
  newPassword: string;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
  emailVerified: boolean;
};

export type AuthSuccessResponse = {
  user: UserResponse;
  message?: string;
};

export type MessageResponse = {
  message: string;
};
