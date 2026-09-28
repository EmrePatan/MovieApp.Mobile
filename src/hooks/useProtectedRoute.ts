import { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { isAuthEntryScreen, isTokenAuthFlowScreen } from '@/auth/auth-route-policy';
import { isAuthDeepLinkRestorePending } from '@/auth/pending-auth-deep-link';
import { consumePendingCatalogDeepLinkPath } from '@/auth/pending-catalog-deep-link';
import { traceAuthDeepLink } from '@/auth/auth-deep-link-trace';
import { useAuth } from '@/auth/useAuth';

function catalogPathsMatch(currentPath: string, pendingPath: string): boolean {
  const normalize = (value: string) => {
    try {
      return decodeURIComponent(value).replace(/\/+$/, '');
    } catch {
      return value.replace(/\/+$/, '');
    }
  };

  return normalize(currentPath) === normalize(pendingPath);
}

/**
 * Central route protection for authenticated vs unauthenticated flows.
 */
export function useProtectedRoute(): void {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
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

    if (isAuthenticated) {
      const pendingCatalogPath = consumePendingCatalogDeepLinkPath();
      if (pendingCatalogPath) {
        if (!catalogPathsMatch(pathname, pendingCatalogPath)) {
          router.replace(pendingCatalogPath);
        }
        return;
      }
    }

    if (isAuthenticated && inAuthGroup && isAuthEntryScreen(authScreen)) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, pathname, router, segments]);
}
