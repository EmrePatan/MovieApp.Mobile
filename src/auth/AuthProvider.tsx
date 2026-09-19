import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/api/client';
import { isApiError } from '@/api/errors';
import {
  getCurrentUser,
  loginRequest,
  registerRequest,
  resendVerificationRequest,
  socialAuthRequest,
  verifyEmailRequest,
} from './auth-api';
import { requestSocialIdentityToken } from './social-auth-service';
import type { SocialAuthProvider } from '@/models/api/auth';
import { getAccessToken, removeAccessToken, saveAccessToken } from './auth-storage';
import type { AuthContextValue } from './auth-types';
import type { UserProfile } from '@/models/api/auth';
import { queryClient } from '@/api/query-client';
import { clearUserQueryCache } from '@/features/profile/utils/clear-user-query-cache';
import {
  resetPushPermissionRequestState,
  unregisterKnownPushDeviceAsync,
} from '@/features/follows/services/push-device-service';
import { markHomePerfEvent } from '@/perf/home-cold-start-trace';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

async function hydrateCurrentUser(
  clearSession: () => Promise<void>,
  setUser: (profile: UserProfile | null) => void,
  isMounted: () => boolean,
) {
  try {
    const currentUser = await getCurrentUser();
    if (isMounted()) {
      setUser(currentUser);
    }
  } catch (error) {
    if (isApiError(error) && error.kind === 'unauthorized') {
      await clearSession();
      return;
    }

    // Backend unavailable: keep token, proceed without blocking startup.
    if (isMounted()) {
      setUser(null);
    }
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const syncToken = useCallback((nextToken: string | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
  }, []);

  const clearSession = useCallback(async () => {
    await removeAccessToken();
    syncToken(null);
    setUser(null);
  }, [syncToken]);

  const establishSession = useCallback(
    async (accessToken: string, profile: UserProfile) => {
      await saveAccessToken(accessToken);
      syncToken(accessToken);
      setUser(profile);
      markHomePerfEvent('session_established');
    },
    [syncToken],
  );

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    api.setTokenGetter(() => tokenRef.current);
    api.setUnauthorizedHandler(() => {
      void handleUnauthorized();
    });
  }, [handleUnauthorized]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      let storedToken: string | null = null;

      try {
        storedToken = await getAccessToken();

        if (!storedToken) {
          if (isMounted) {
            syncToken(null);
            setUser(null);
          }
          return;
        }

        syncToken(storedToken);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      if (!storedToken) {
        return;
      }

      await hydrateCurrentUser(
        clearSession,
        (profile) => {
          if (isMounted) {
            setUser(profile);
          }
        },
        () => isMounted,
      );
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession, syncToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      markHomePerfEvent('login_response');
      await establishSession(response.accessToken, response.user);
    },
    [establishSession],
  );

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const response = await registerRequest({ email, password, displayName });
    return {
      email: response.email,
      message: response.message,
    };
  }, []);

  const verifyEmail = useCallback(
    async (token: string) => {
      const response = await verifyEmailRequest({ token });
      await establishSession(response.accessToken, response.user);
    },
    [establishSession],
  );

  const resendVerification = useCallback(async (email: string) => {
    const response = await resendVerificationRequest({ email });
    return response.message;
  }, []);

  const signInWithSocial = useCallback(
    async (provider: SocialAuthProvider) => {
      const identityToken = await requestSocialIdentityToken(provider);
      const response = await socialAuthRequest({ provider, identityToken });
      await establishSession(response.accessToken, response.user);
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    try {
      await unregisterKnownPushDeviceAsync();
    } catch {
      // Logout should continue even if push unregister fails.
    }

    clearUserQueryCache(queryClient);
    resetPushPermissionRequestState();
    await clearSession();
  }, [clearSession]);

  const updateSession = useCallback(
    async (accessToken: string, profile: UserProfile) => {
      await establishSession(accessToken, profile);
    },
    [establishSession],
  );

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) {
      return;
    }

    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      register,
      verifyEmail,
      resendVerification,
      signInWithSocial,
      logout,
      refreshUser,
      updateSession,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      verifyEmail,
      resendVerification,
      signInWithSocial,
      logout,
      refreshUser,
      updateSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
