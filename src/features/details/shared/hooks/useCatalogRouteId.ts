import { useRef } from 'react';
import { useLocalSearchParams, usePathname, useSegments } from 'expo-router';
import {
  normalizeRouteIdParam,
  parseCatalogIdFromPathname,
  parseCatalogStackCatalogId,
  resolveCatalogRouteId,
} from '../routes';

export function useCatalogRouteIdState(contentType: 'movie' | 'tv') {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const segments = useSegments();
  const pathname = usePathname();
  const rawId = normalizeRouteIdParam(params.id);
  const resolvedId =
    resolveCatalogRouteId(params.id, segments, pathname, contentType)
    ?? parseCatalogStackCatalogId(pathname, contentType);
  const pathnameId = parseCatalogIdFromPathname(pathname, contentType);
  const isDetailPathActive = Boolean(pathnameId);

  const stableIdRef = useRef<string | undefined>(undefined);
  if (resolvedId) {
    stableIdRef.current = resolvedId;
  }
  const stableResolvedId = resolvedId ?? stableIdRef.current;

  return {
    rawId,
    pathname,
    resolvedId: stableResolvedId,
    isDetailPathActive,
    isInvalid: Boolean(rawId) && !stableResolvedId,
  };
}
