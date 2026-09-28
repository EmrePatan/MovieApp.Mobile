import { buildWatchlistShareRouterPath, parseWatchlistShareDeepLink } from '@/auth/watchlist-share-deep-link';

export function resolveWatchlistShareDeepLinkRouterPath(pathOrUrl: string): string | null {
  const token = parseWatchlistShareDeepLink(pathOrUrl);
  if (!token) {
    return null;
  }

  return buildWatchlistShareRouterPath(token);
}
