import { useLocalSearchParams, usePathname } from 'expo-router';
import { normalizeRouteIdParam, parsePositiveInt } from '../../shared/routes';

export function usePersonRouteTmdbId() {
  const pathname = usePathname();
  const { tmdbId: rawTmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const isActive = /\/person\/[^/]+/.test(pathname);
  const tmdbId = isActive ? parsePositiveInt(normalizeRouteIdParam(rawTmdbId)) : null;

  return {
    tmdbId,
    isActive,
    isInvalid: isActive && tmdbId == null,
  };
}
