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
  ensurePushDeviceRegisteredAsync,
  resetPushPermissionRequestState,
  unregisterKnownPushDeviceAsync,
} from '@/features/follows/services/push-device-service';
import { ensureAuthDeepLinkListener } from '@/auth/pending-auth-deep-link';
import { markHomePerfEvent } from '@/perf/home-cold-start-trace';

ensureAuthDeepLinkListener();

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

async function hydrateCurrentUser(
  endAuthenticatedSession: () => Promise<void>,
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
      await endAuthenticatedSession();
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
  const [isSessionRestored, setIsSessionRestored] = useState(false);
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
      void ensurePushDeviceRegisteredAsync({ allowPermissionRequest: false });
    },
    [syncToken],
  );

  const endAuthenticatedSession = useCallback(
    async (options?: { resetPushPermission?: boolean }) => {
      try {
        await unregisterKnownPushDeviceAsync();
      } catch {
        // Session teardown should continue even if push unregister fails.
      }

      if (options?.resetPushPermission) {
        resetPushPermissionRequestState();
      }

      await clearSession();
    },
    [clearSession],
  );

  const handleUnauthorized = useCallback(async () => {
    await endAuthenticatedSession();
  }, [endAuthenticatedSession]);

  useEffect(() => {
    api.setTokenGetter(() => tokenRef.current);
    api.setUnauthorizedHandler(() => handleUnauthorized());
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
            setIsSessionRestored(true);
          }
          return;
        }

        syncToken(storedToken);

        await hydrateCurrentUser(
          () => endAuthenticatedSession(),
          (profile) => {
            if (isMounted) {
              setUser(profile);
            }
          },
          () => isMounted,
        );
      } finally {
        if (isMounted) {
          setIsSessionRestored(true);
          setIsLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession, endAuthenticatedSession, syncToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      markHomePerfEvent('login_response');
      await establishSession(response.accessToken, response.user);
    },
    [establishSession],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      await clearSession();
      const response = await registerRequest({ email, password, displayName });
      return {
        email: response.email,
        message: response.message,
      };
    },
    [clearSession],
  );

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
    clearUserQueryCache(queryClient);
    await endAuthenticatedSession({ resetPushPermission: true });
  }, [endAuthenticatedSession]);

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
      isSessionRestored,
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
      isSessionRestored,
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
