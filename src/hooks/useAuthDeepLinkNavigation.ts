import { useLayoutEffect, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import type { AuthDeepLinkTarget } from '@/auth/auth-deep-link';
import { parseAuthDeepLink } from '@/auth/auth-deep-link';
import { buildAuthDeepLinkRouterHref } from '@/auth/auth-deep-link-route';
import { isTokenAuthFlowScreen } from '@/auth/auth-route-policy';
import { traceAuthDeepLink } from '@/auth/auth-deep-link-trace';
import {
  captureAuthDeepLink,
  consumePendingAuthDeepLink,
  hasPendingAuthDeepLink,
  markAuthDeepLinkRestoreComplete,
} from '@/auth/pending-auth-deep-link';
import { useAuth } from '@/auth/useAuth';

function navigateToAuthDeepLink(router: ReturnType<typeof useRouter>, target: AuthDeepLinkTarget) {
  const href = buildAuthDeepLinkRouterHref(target);
  traceAuthDeepLink('restore_navigate', { flow: target.kind });
  router.replace(href);
}

/**
 * Restores auth deep links captured during cold start while startup gates delay navigation.
 * Complements Expo Router +native-intent handling for late URL delivery and warm links.
 */
export function useAuthDeepLinkNavigation(): void {
  const router = useRouter();
  const segments = useSegments();
  const { isLoading } = useAuth();

  useLayoutEffect(() => {
    if (isLoading) {
      traceAuthDeepLink('restore_skipped_loading');
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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const authScreen = (segments as string[])[1];
    if (isTokenAuthFlowScreen(authScreen)) {
      markAuthDeepLinkRestoreComplete();
      return;
    }

    if (hasPendingAuthDeepLink()) {
      const pendingTarget = consumePendingAuthDeepLink();
      if (pendingTarget) {
        navigateToAuthDeepLink(router, pendingTarget);
      }
    }
  }, [isLoading, router, segments]);
}
