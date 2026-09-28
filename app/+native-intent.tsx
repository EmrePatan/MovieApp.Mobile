import { resolveAuthDeepLinkRouterPath } from '@/auth/auth-deep-link-route';
import { traceAuthDeepLink } from '@/auth/auth-deep-link-trace';
import { resolveCatalogDeepLinkRouterPath } from '@/auth/catalog-deep-link-route';
import { captureCatalogDeepLink } from '@/auth/pending-catalog-deep-link';

/**
 * Expo Router entry point for standalone iOS/Android cold-start URLs.
 * Maps custom-scheme auth links to grouped auth routes before router matching.
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  const catalogPath = resolveCatalogDeepLinkRouterPath(path);
  if (catalogPath) {
    if (initial) {
      captureCatalogDeepLink(path, { initial: true });
    }
    return catalogPath;
  }

  const redirected = resolveAuthDeepLinkRouterPath(path);
  if (!redirected) {
    return path;
  }

  traceAuthDeepLink('native_intent_redirect', {
    initial,
    hasUrl: true,
    flow: redirected.includes('verify-email') ? 'verify-email' : 'reset-password',
  });

  return redirected;
}
