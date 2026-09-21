import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { isAuthEntryScreen } from '@/auth/auth-route-policy';
import { hasPendingAuthDeepLink } from '@/auth/pending-auth-deep-link';
import { useAuth } from '@/auth/useAuth';

/**
 * Central route protection for authenticated vs unauthenticated flows.
 */
export function useProtectedRoute(): void {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || hasPendingAuthDeepLink()) {
      return;
    }

    const segmentList = segments as string[];
    const inAuthGroup = segmentList[0] === '(auth)';
    const authScreen = segmentList[1];

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup && isAuthEntryScreen(authScreen)) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, router, segments]);
}
