import { useLayoutEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { resolveCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';
import {
  captureCatalogDeepLink,
  consumePendingCatalogDeepLinkPath,
  peekPendingCatalogDeepLinkPath,
} from '@/auth/pending-catalog-deep-link';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { useAuth } from '@/auth/useAuth';

export function useCatalogDeepLinkNavigation(): void {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }

    const openPending = () => {
      // Consume only after login. Peeking while signed out leaves the path
      // for the auth guard to open once the session exists.
      const pendingPath = isAuthenticated
        ? consumePendingCatalogDeepLinkPath()
        : peekPendingCatalogDeepLinkPath();
      if (!pendingPath || !isAuthenticated) {
        return;
      }

      trackProductMetric(PRODUCT_METRICS.sharedContentLinkOpened);
      router.push(pendingPath);
    };

    openPending();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const path = resolveCatalogDeepLinkRouterPath(url);
      if (!path) {
        return;
      }

      if (!isAuthenticated) {
        captureCatalogDeepLink(url);
        return;
      }

      trackProductMetric(PRODUCT_METRICS.sharedContentLinkOpened);
      router.push(path);
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isLoading, router]);
}
