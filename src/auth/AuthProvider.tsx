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
import { getCurrentUser, loginRequest, registerRequest } from './auth-api';
import { getAccessToken, removeAccessToken, saveAccessToken } from './auth-storage';
import type { AuthContextValue } from './auth-types';
import type { UserProfile } from '@/models/api/auth';
import { queryClient } from '@/api/query-client';
import { clearUserQueryCache } from '@/features/profile/utils/clear-user-query-cache';
import {
  resetPushPermissionRequestState,
  unregisterKnownPushDeviceAsync,
} from '@/features/follows/services/push-device-service';

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
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
      try {
        const storedToken = await getAccessToken();

        if (!storedToken) {
          if (isMounted) {
            syncToken(null);
            setUser(null);
          }
          return;
        }

        syncToken(storedToken);

        try {
          const currentUser = await getCurrentUser();
          if (isMounted) {
            setUser(currentUser);
          }
        } catch (error) {
          if (isApiError(error) && error.kind === 'unauthorized') {
            await clearSession();
            return;
          }

          // Backend unavailable: keep token, proceed without blocking startup.
          if (isMounted) {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession, syncToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      await establishSession(response.accessToken, response.user);
    },
    [establishSession],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const response = await registerRequest({ email, password, displayName });
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
      logout,
      refreshUser,
      updateSession,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, updateSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
