import { usePathname } from 'expo-router';
import {
  isCatalogChildDestinationPathname,
  parseCatalogIdFromPathname,
  parseCatalogStackSegment,
} from '../routes';

/**
 * Catalog detail index routes must resolve their id from the active pathname only.
 * Expo Router can keep stale `params.id` values during stack transitions; using them
 * causes brief or stuck "invalid request" states and wrong detail queries.
 */
export function useCatalogRouteIdState(contentType: 'movie' | 'tv') {
  const pathname = usePathname();
  const pathnameId = parseCatalogIdFromPathname(pathname, contentType);
  const isDetailPathActive = pathnameId != null;
  const rawSegment = parseCatalogStackSegment(pathname, contentType);
  const isChildDestination = isCatalogChildDestinationPathname(pathname, contentType);

  return {
    pathname,
    resolvedId: isDetailPathActive ? pathnameId : undefined,
    isDetailPathActive,
    isInvalid: Boolean(rawSegment) && !isChildDestination && !pathnameId,
  };
}
