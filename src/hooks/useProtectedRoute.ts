import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { isAuthEntryScreen, isTokenAuthFlowScreen } from '@/auth/auth-route-policy';
import { isAuthDeepLinkRestorePending } from '@/auth/pending-auth-deep-link';
import { traceAuthDeepLink } from '@/auth/auth-deep-link-trace';
import { useAuth } from '@/auth/useAuth';

/**
 * Central route protection for authenticated vs unauthenticated flows.
 */
export function useProtectedRoute(): void {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isAuthDeepLinkRestorePending()) {
      if (isAuthDeepLinkRestorePending()) {
        traceAuthDeepLink('guard_blocked', {
          segment: (segments as string[]).join('/'),
        });
      }
      return;
    }

    const segmentList = segments as string[];
    const inAuthGroup = segmentList[0] === '(auth)';
    const authScreen = segmentList[1];

    if (!isAuthenticated && inAuthGroup && isTokenAuthFlowScreen(authScreen)) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup && isAuthEntryScreen(authScreen)) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, router, segments]);
}
