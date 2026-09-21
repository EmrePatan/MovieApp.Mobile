import { useLayoutEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import type { AuthDeepLinkTarget } from '@/auth/auth-deep-link';
import { parseAuthDeepLink } from '@/auth/auth-deep-link';
import {
  captureAuthDeepLink,
  consumePendingAuthDeepLink,
} from '@/auth/pending-auth-deep-link';
import { useAuth } from '@/auth/useAuth';

function navigateToAuthDeepLink(router: ReturnType<typeof useRouter>, target: AuthDeepLinkTarget) {
  if (target.kind === 'verify-email') {
    router.replace({
      pathname: '/(auth)/verify-email',
      params: { token: target.token },
    });
    return;
  }

  router.replace({
    pathname: '/(auth)/reset-password',
    params: { token: target.token },
  });
}

/**
 * Restores auth deep links captured during cold start while startup gates delay navigation.
 */
export function useAuthDeepLinkNavigation(): void {
  const router = useRouter();
  const { isLoading } = useAuth();

  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }

    const pendingTarget = consumePendingAuthDeepLink();
    if (pendingTarget) {
      navigateToAuthDeepLink(router, pendingTarget);
    }

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const target = parseAuthDeepLink(url);
      if (target) {
        navigateToAuthDeepLink(router, target);
        return;
      }

      captureAuthDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [isLoading, router]);
}
