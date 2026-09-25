import { useState } from 'react';
import { useIsFocused, useLocalSearchParams, usePathname } from 'expo-router';
import {
  normalizeRouteIdParam,
  parseCollectionStackSegment,
  parseCollectionTmdbIdFromPathname,
  parsePositiveInt,
} from '../../shared/routes';

export function useCollectionRouteTmdbId() {
  const pathname = usePathname();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{ tmdbId?: string | string[] }>();
  const rawParam = normalizeRouteIdParam(params.tmdbId);
  const paramTmdbId = parsePositiveInt(rawParam);
  const pathnameTmdbId = parseCollectionTmdbIdFromPathname(pathname);
  const rawSegment = parseCollectionStackSegment(pathname);
  // Pathname is global. Only the focused collection may trust it; a screen
  // underneath must keep its own param or the last id it already resolved.
  const ownId = isFocused ? (pathnameTmdbId ?? paramTmdbId) : paramTmdbId;

  const [stableId, setStableId] = useState(ownId);
  if (ownId != null && ownId !== stableId) {
    setStableId(ownId);
  }

  const tmdbId = ownId ?? stableId;
  const focusedSegmentInvalid = isFocused && Boolean(rawSegment) && pathnameTmdbId == null;
  const paramInvalid = Boolean(rawParam) && paramTmdbId == null;

  return {
    tmdbId,
    isActive: tmdbId != null,
    isInvalid: (focusedSegmentInvalid || paramInvalid) && tmdbId == null,
  };
}
