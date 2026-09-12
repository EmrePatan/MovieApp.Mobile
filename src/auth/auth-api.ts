import { api } from '@/api/client';
import type {
  AuthResponse,
  CurrentUserResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/models/api/auth';

export async function loginRequest(payload: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', payload, { authenticated: false });
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', payload, { authenticated: false });
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
