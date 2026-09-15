import type { ImperativeRouter } from 'expo-router';

export type SearchReturnOrigin = 'home' | 'discover';

const SEARCH_RETURN_HREFS: Record<SearchReturnOrigin, `/(tabs)/${string}`> = {
  home: '/(tabs)/home',
  discover: '/(tabs)/discover',
};

let lastSearchReturnOrigin: SearchReturnOrigin | null = null;

export function parseSearchReturnOrigin(value: string | string[] | undefined): SearchReturnOrigin | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === 'home' || raw === 'discover') {
    return raw;
  }

  return null;
}

export function openSearch(router: ImperativeRouter, origin: SearchReturnOrigin): void {
  lastSearchReturnOrigin = origin;
  router.push(`/search?from=${origin}`);
}

export function returnFromSearch(router: ImperativeRouter, origin?: SearchReturnOrigin | null): void {
  const resolvedOrigin = origin ?? lastSearchReturnOrigin ?? 'home';
  lastSearchReturnOrigin = null;
  router.dismissTo(SEARCH_RETURN_HREFS[resolvedOrigin]);
}

export function resetSearchNavigationForTests(): void {
  lastSearchReturnOrigin = null;
}
