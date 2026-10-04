import { resolveAppShellTabOrigin } from '@/features/navigation/app-shell-tab-origin';
import type { HighlightedPrimaryTab, PrimaryTabId } from '@/features/navigation/primary-tab-types';

export type { HighlightedPrimaryTab, PrimaryTabId } from '@/features/navigation/primary-tab-types';

export const PRIMARY_TAB_HREFS: Record<PrimaryTabId, `/${string}`> = {
  home: '/home',
  discover: '/discover',
  library: '/library',
  insights: '/insights',
};

const CATALOG_DETAIL_ROUTE_PREFIXES = [
  '/movie/',
  '/tv/',
  '/person/',
  '/collection/',
] as const;

const DISCOVER_ROUTE_PREFIXES = [
  '/discover',
  '/discover-browse',
  '/advanced-discover',
  '/streaming-discover',
  '/streaming-platforms',
  '/discover-genres',
  '/world-cinema',
  '/now-in-theaters',
  '/on-tv-this-week',
  '/ai-recommendations',
  '/pick-something',
] as const;

const LIBRARY_ROUTE_PREFIXES = [
  '/library',
  '/favorites',
  '/following',
  '/watch-history',
  '/upcoming',
  '/watchlist',
  '/notifications',
] as const;

const INSIGHTS_ROUTE_PREFIXES = ['/insights'] as const;

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isCatalogDetailRoute(pathname: string): boolean {
  return CATALOG_DETAIL_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPrimaryTabRootPath(tabId: PrimaryTabId, pathname: string): boolean {
  return pathname === PRIMARY_TAB_HREFS[tabId];
}

export function resolveActivePrimaryTab(pathname: string): HighlightedPrimaryTab {
  if (isCatalogDetailRoute(pathname)) {
    return null;
  }

  const originTab = resolveAppShellTabOrigin(pathname);
  if (originTab) {
    return originTab;
  }

  if (DISCOVER_ROUTE_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))) {
    return 'discover';
  }

  if (LIBRARY_ROUTE_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))) {
    return 'library';
  }

  if (INSIGHTS_ROUTE_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))) {
    return 'insights';
  }

  return 'home';
}
