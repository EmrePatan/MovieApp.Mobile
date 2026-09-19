export type { ProblemDetails } from '@/api/errors';

export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  displayName: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  email: string;
  requiresEmailVerification: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export type SocialAuthProvider = 'google' | 'apple';

export interface SocialAuthRequest {
  provider: SocialAuthProvider;
  identityToken: string;
}

export type CurrentUserResponse = UserProfile;
