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

export type CurrentUserResponse = UserProfile;
