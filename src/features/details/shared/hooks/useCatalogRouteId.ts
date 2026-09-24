import { useLocalSearchParams } from 'expo-router';
import { isValidGuid, normalizeRouteIdParam } from '../routes';

/**
 * Catalog detail index routes must resolve their id from their own route params.
 * The pathname is global: when detail B is pushed over detail A, A is still mounted
 * underneath and would otherwise re-render as B, which iOS reveals during back-swipe.
 */
export function useCatalogRouteIdState() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = normalizeRouteIdParam(id);
  const resolvedId = isValidGuid(rawId) ? rawId : undefined;

  return {
    resolvedId,
    isDetailPathActive: resolvedId != null,
    isInvalid: Boolean(rawId) && !resolvedId,
  };
}
