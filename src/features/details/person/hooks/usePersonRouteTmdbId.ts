import { useState } from 'react';
import { useIsFocused, useLocalSearchParams, usePathname } from 'expo-router';
import {
  normalizeRouteIdParam,
  parsePersonTmdbIdFromPathname,
  parsePositiveInt,
} from '../../shared/routes';

export function usePersonRouteTmdbId() {
  const pathname = usePathname();
  const isFocused = useIsFocused();
  const { tmdbId: rawTmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const paramTmdbId = parsePositiveInt(normalizeRouteIdParam(rawTmdbId));
  const pathnameTmdbId = parsePersonTmdbIdFromPathname(pathname);
  // Pathname is global. A focused screen still prefers it when params are stale.
  // An unfocused screen must not adopt the person id of the screen on top.
  const ownId = isFocused ? (pathnameTmdbId ?? paramTmdbId) : paramTmdbId;

  const [stableId, setStableId] = useState(ownId);
  if (ownId != null && ownId !== stableId) {
    setStableId(ownId);
  }

  const tmdbId = ownId ?? stableId;

  return {
    tmdbId,
    isPersonPathActive: isFocused && pathnameTmdbId != null,
    isInvalid: Boolean(normalizeRouteIdParam(rawTmdbId)) && tmdbId == null,
  };
}
