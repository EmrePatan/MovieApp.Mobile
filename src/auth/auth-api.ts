import { api } from '@/api/client';
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '@/models/api/auth';

export async function loginRequest(payload: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', payload, { authenticated: false });
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', payload, { authenticated: false });
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return api.get<CurrentUserResponse>('/api/auth/me');
}
