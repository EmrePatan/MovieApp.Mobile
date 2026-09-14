import { useLocalSearchParams, usePathname, useSegments } from 'expo-router';
import {
  normalizeRouteIdParam,
  parseCatalogIdFromPathname,
  resolveCatalogRouteId,
} from '../routes';

export function useCatalogRouteIdState(contentType: 'movie' | 'tv') {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const segments = useSegments();
  const pathname = usePathname();
  const rawId = normalizeRouteIdParam(params.id);
  const pathnameId = parseCatalogIdFromPathname(pathname, contentType);
  const isActive = Boolean(pathnameId);
  const resolvedId = isActive
    ? resolveCatalogRouteId(params.id, segments, pathname, contentType)
    : undefined;

  return {
    rawId,
    pathname,
    resolvedId,
    isActive,
    isInvalid: isActive && Boolean(rawId) && !resolvedId,
  };
}
