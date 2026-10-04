/**
 * App-shell routes that can be opened from multiple primary tabs. Tab highlight
 * should follow navigation origin, not only the route's default owner.
 */
export const SHARED_PRIMARY_TAB_CONTEXT_PREFIXES = [
  '/discover-browse',
  '/upcoming',
  '/on-tv-this-week',
  '/now-in-theaters',
  '/streaming-discover',
  '/streaming-platforms',
  '/discover-genres',
  '/notifications',
  '/following',
  '/favorites',
  '/watch-history',
  '/watchlist',
] as const;

export function normalizeAppShellPathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? pathname;
  return withoutQuery.length > 0 ? withoutQuery : pathname;
}

export function isSharedPrimaryTabContextRoute(pathname: string): boolean {
  const normalized = normalizeAppShellPathname(pathname);
  return SHARED_PRIMARY_TAB_CONTEXT_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
