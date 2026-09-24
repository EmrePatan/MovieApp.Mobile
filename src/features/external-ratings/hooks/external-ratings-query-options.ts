import type { QueryClient } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import { getExternalRatings } from '../api/external-ratings-api';
import type { ExternalRatingsMediaType } from '../types';
import { externalRatingsQueryKey } from './external-ratings-query-keys';

export const EXTERNAL_RATINGS_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export function externalRatingsQueryOptions(
  mediaType: ExternalRatingsMediaType,
  contentId: string,
) {
  return {
    queryKey: externalRatingsQueryKey(mediaType, contentId),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getExternalRatings(mediaType, contentId, signal),
    staleTime: EXTERNAL_RATINGS_STALE_TIME_MS,
  };
}

export function prefetchExternalRatings(
  queryClient: QueryClient,
  mediaType: ExternalRatingsMediaType,
  contentId: string,
): void {
  if (!isValidGuid(contentId)) {
    return;
  }

  void queryClient.prefetchQuery(externalRatingsQueryOptions(mediaType, contentId));
}
