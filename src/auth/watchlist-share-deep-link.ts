const WATCHLIST_SHARE_PATH_PATTERN = /^\/watchlist\/([A-Za-z0-9_-]{32,128})/;

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseWatchlistSharePath(pathname: string): string | null {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const match = normalized.match(WATCHLIST_SHARE_PATH_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  const token = decodePathSegment(match[1]);
  return WATCHLIST_SHARE_PATH_PATTERN.test(`/watchlist/${token}`) ? token : null;
}

export function parseWatchlistShareDeepLink(pathOrUrl: string): string | null {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return parseWatchlistSharePath(url.pathname);
      }
    }
  } catch {
    return null;
  }

  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('?')[0] ?? '';
  const pathOnly = withoutScheme.startsWith('/') ? withoutScheme : `/${withoutScheme}`;
  return parseWatchlistSharePath(pathOnly);
}

export function buildWatchlistShareRouterPath(token: string): string {
  return `/public-watchlist/${encodeURIComponent(token)}`;
}
