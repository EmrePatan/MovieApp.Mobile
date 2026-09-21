import type { AuthDeepLinkTarget } from '@/auth/auth-deep-link';
import { parseAuthDeepLink } from '@/auth/auth-deep-link';

export function buildAuthDeepLinkRouterHref(target: AuthDeepLinkTarget): {
  pathname: '/(auth)/verify-email' | '/(auth)/reset-password';
  params: { token: string };
} {
  if (target.kind === 'verify-email') {
    return {
      pathname: '/(auth)/verify-email',
      params: { token: target.token },
    };
  }

  return {
    pathname: '/(auth)/reset-password',
    params: { token: target.token },
  };
}

/**
 * Maps custom-scheme auth URLs to Expo Router hrefs.
 * Used by +native-intent and the startup restore fallback.
 */
export function resolveAuthDeepLinkRouterPath(pathOrUrl: string): string | null {
  const target = parseAuthDeepLink(pathOrUrl);
  if (!target) {
    return null;
  }

  const href = buildAuthDeepLinkRouterHref(target);
  const encodedToken = encodeURIComponent(href.params.token);
  return `${href.pathname}?token=${encodedToken}`;
}
