export type {
  UserProfile,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '@/models/api/auth';

export interface AuthState {
  user: import('@/models/api/auth').UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionRestored: boolean;
}

export interface RegisterResult {
  email: string;
  message: string;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<RegisterResult>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<string>;
  signInWithSocial: (provider: import('@/models/api/auth').SocialAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateSession: (accessToken: string, user: import('@/models/api/auth').UserProfile) => Promise<void>;
}
