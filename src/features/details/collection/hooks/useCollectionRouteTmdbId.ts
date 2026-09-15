import { useLocalSearchParams, usePathname } from 'expo-router';
import { normalizeRouteIdParam, parsePositiveInt } from '../../shared/routes';

export function useCollectionRouteTmdbId() {
  const pathname = usePathname();
  const { tmdbId: rawTmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const isActive = /\/collection\/[^/]+/.test(pathname);
  const tmdbId = isActive ? parsePositiveInt(normalizeRouteIdParam(rawTmdbId)) : null;

  return {
    tmdbId,
    isActive,
    isInvalid: isActive && tmdbId == null,
  };
}
