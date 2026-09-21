import { useRef } from 'react';
import { useLocalSearchParams, usePathname } from 'expo-router';
import {
  normalizeRouteIdParam,
  parsePersonTmdbIdFromPathname,
  parsePositiveInt,
} from '../../shared/routes';

export function usePersonRouteTmdbId() {
  const pathname = usePathname();
  const { tmdbId: rawTmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const paramTmdbId = parsePositiveInt(normalizeRouteIdParam(rawTmdbId));
  const pathnameTmdbId = parsePersonTmdbIdFromPathname(pathname);
  const resolvedTmdbId = pathnameTmdbId ?? paramTmdbId;
  const isPersonPathActive = pathnameTmdbId != null;

  const stableIdRef = useRef<number | null>(null);
  const routeKeyRef = useRef<string | undefined>(undefined);
  const routeKey = `${pathname}:${pathnameTmdbId ?? normalizeRouteIdParam(rawTmdbId) ?? ''}`;

  if (routeKeyRef.current !== routeKey) {
    routeKeyRef.current = routeKey;
    if (resolvedTmdbId != null) {
      stableIdRef.current = resolvedTmdbId;
    }
  } else if (resolvedTmdbId != null) {
    stableIdRef.current = resolvedTmdbId;
  }

  const stableTmdbId = resolvedTmdbId ?? stableIdRef.current;

  return {
    tmdbId: stableTmdbId,
    isPersonPathActive,
    isInvalid: Boolean(normalizeRouteIdParam(rawTmdbId)) && stableTmdbId == null,
  };
}
