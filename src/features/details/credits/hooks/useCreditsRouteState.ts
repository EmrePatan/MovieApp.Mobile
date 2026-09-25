import { useState } from 'react';
import { useLocalSearchParams, usePathname } from 'expo-router';
import {
  isValidGuid,
  normalizeRouteIdParam,
  parseCreditsCatalogIdFromPathname,
} from '@/features/details/shared/routes';

function normalizeRouteStringParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function useCreditsRouteState(contentType: 'movie' | 'tv') {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[] }>();
  const paramId = normalizeRouteIdParam(params.id);
  const pathnameId = parseCreditsCatalogIdFromPathname(pathname, contentType);
  const resolvedId = isValidGuid(paramId) ? paramId : pathnameId;
  const title = normalizeRouteStringParam(params.title);
  const hasRouteContext = Boolean(paramId || pathnameId);

  // Global pathname updates before this screen unmounts. Keep the last id so a
  // back-swipe, or a screen pushed on top, does not blank the credits query.
  const [stableId, setStableId] = useState(resolvedId);
  if (resolvedId && resolvedId !== stableId) {
    setStableId(resolvedId);
  }
  const stableResolvedId = resolvedId ?? stableId;

  return {
    resolvedId: stableResolvedId,
    isInvalid: hasRouteContext && !stableResolvedId,
    title,
  };
}
