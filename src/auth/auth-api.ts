import { api } from '@/api/client';
import type {
  AuthResponse,
  CurrentUserResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  SocialAuthRequest,
  VerifyEmailRequest,
} from '@/models/api/auth';

export async function loginRequest(payload: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', payload, { authenticated: false });
}

export async function registerRequest(payload: RegisterRequest): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/api/auth/register', payload, { authenticated: false });
}

export async function verifyEmailRequest(payload: VerifyEmailRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/verify-email', payload, { authenticated: false });
}

export async function resendVerificationRequest(
  payload: ResendVerificationRequest,
): Promise<MessageResponse> {
  return api.post<MessageResponse>('/api/auth/resend-verification', payload, {
    authenticated: false,
  });
}

export async function forgotPasswordRequest(payload: ForgotPasswordRequest): Promise<MessageResponse> {
  return api.post<MessageResponse>('/api/auth/forgot-password', payload, { authenticated: false });
}

export async function resetPasswordRequest(payload: ResetPasswordRequest): Promise<MessageResponse> {
  return api.post<MessageResponse>('/api/auth/reset-password', payload, { authenticated: false });
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return api.get<CurrentUserResponse>('/api/auth/me');
}

export async function socialAuthRequest(payload: SocialAuthRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/social', payload, { authenticated: false });
}

export async function refreshSessionRequest(payload: RefreshTokenRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/refresh', payload, {
    authenticated: false,
    suppressUnauthorizedHandler: true,
  });
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post<void>('/api/auth/logout', { refreshToken }, {
    authenticated: false,
    suppressUnauthorizedHandler: true,
  });
}
