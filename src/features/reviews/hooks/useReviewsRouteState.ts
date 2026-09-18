import { useRef } from 'react';
import { useLocalSearchParams, usePathname } from 'expo-router';
import {
  isValidGuid,
  normalizeRouteIdParam,
  parseReviewsCatalogIdFromPathname,
} from '@/features/details/shared/routes';

function normalizeRouteStringParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function useReviewsRouteState(contentType: 'movie' | 'tv') {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[] }>();
  const paramId = normalizeRouteIdParam(params.id);
  const pathnameId = parseReviewsCatalogIdFromPathname(pathname, contentType);
  const resolvedId = isValidGuid(paramId) ? paramId : pathnameId;
  const title = normalizeRouteStringParam(params.title);
  const hasRouteContext = Boolean(paramId || pathnameId);

  // Keep the last resolved id while the native stack pop animation finishes.
  // Global pathname updates before the screen unmounts, which previously made
  // reviews screens return null mid-gesture and produced a janky back-swipe.
  const stableIdRef = useRef<string | undefined>(undefined);
  if (resolvedId) {
    stableIdRef.current = resolvedId;
  }
  const stableResolvedId = resolvedId ?? stableIdRef.current;

  return {
    resolvedId: stableResolvedId,
    isInvalid: hasRouteContext && !stableResolvedId,
    title,
  };
}
