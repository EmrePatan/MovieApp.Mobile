import type { ImperativeRouter } from 'expo-router';

export type SearchReturnOrigin = 'home' | 'discover' | 'library';

export type SearchScope = 'catalog' | 'library';

const SEARCH_RETURN_HREFS: Record<SearchReturnOrigin, `/(tabs)/${string}`> = {
  home: '/(tabs)/home',
  discover: '/(tabs)/discover',
  library: '/(tabs)/library',
};

let lastSearchReturnOrigin: SearchReturnOrigin | null = null;

export function parseSearchReturnOrigin(value: string | string[] | undefined): SearchReturnOrigin | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === 'home' || raw === 'discover' || raw === 'library') {
    return raw;
  }

  return null;
}

export function parseSearchScope(value: string | string[] | undefined): SearchScope {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === 'library') {
    return 'library';
  }

  return 'catalog';
}

interface OpenSearchOptions {
  scope?: SearchScope;
}

export function openSearch(
  router: ImperativeRouter,
  origin: SearchReturnOrigin,
  options?: OpenSearchOptions,
): void {
  lastSearchReturnOrigin = origin;
  const params = new URLSearchParams({ from: origin });

  if (options?.scope === 'library') {
    params.set('scope', 'library');
  }

  router.push(`/search?${params.toString()}`);
}

export function returnFromSearch(router: ImperativeRouter, origin?: SearchReturnOrigin | null): void {
  const resolvedOrigin = origin ?? lastSearchReturnOrigin ?? 'home';
  lastSearchReturnOrigin = null;
  router.dismissTo(SEARCH_RETURN_HREFS[resolvedOrigin]);
}

export function resetSearchNavigationForTests(): void {
  lastSearchReturnOrigin = null;
}
