import { useQuery } from '@tanstack/react-query';
import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import { getAdvancedDiscover } from '../api/discovery-api';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  STREAMING_HUB_PREVIEW_SIZE,
  STREAMING_HUB_WEEKLY_STALE_MS,
} from '../streaming-platform-hub-types';
import { getIsoWeekId } from '../utils/iso-week-id';
import { streamingProviderPreviewQueryKey } from './discovery-query-keys';

export function useStreamingProviderPreview(
  providerId: number | null,
  watchRegion: string,
  mediaType: AdvancedDiscoverMediaType = DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  queryEnabled = true,
  pageSize: number = STREAMING_HUB_PREVIEW_SIZE,
) {
  const weekId = getIsoWeekId();

  return useQuery({
    queryKey: streamingProviderPreviewQueryKey(providerId, mediaType, watchRegion, weekId, pageSize),
    enabled: queryEnabled && providerId != null && providerId > 0,
    queryFn: ({ signal }) =>
      getAdvancedDiscover(
        {
          mediaType,
          page: 1,
          pageSize,
          genreIds: [],
          year: null,
          yearFrom: null,
          yearTo: null,
          minRating: null,
          minRuntimeMinutes: null,
          maxRuntimeMinutes: null,
          originalLanguage: null,
          originCountry: null,
          watchRegion,
          watchProviderIds: [providerId!],
          watchMonetizationTypes: ['stream'],
          sort: 'popularity_desc',
        },
        signal,
      ),
    staleTime: STREAMING_HUB_WEEKLY_STALE_MS,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
