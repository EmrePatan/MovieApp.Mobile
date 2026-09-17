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
  const pathnameId = parseReviewsCatalogIdFromPathname(pathname, contentType);
  const isActive = Boolean(pathnameId);
  const paramId = normalizeRouteIdParam(params.id);
  const resolvedId = isValidGuid(paramId) ? paramId : pathnameId;
  const title = normalizeRouteStringParam(params.title);

  return {
    resolvedId,
    isActive,
    isInvalid: isActive && !resolvedId,
    title,
  };
}
