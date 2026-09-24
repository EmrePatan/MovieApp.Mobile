import { useQuery } from '@tanstack/react-query';
import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import { getAdvancedDiscover } from '../api/discovery-api';
import { buildAdvancedDiscoverRequest } from '../utils/build-advanced-discover-request';
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
        buildAdvancedDiscoverRequest({
          mediaType,
          page: 1,
          pageSize,
          watchRegion,
          watchProviderIds: [providerId!],
          watchMonetizationTypes: ['stream'],
        }),
        signal,
      ),
    staleTime: STREAMING_HUB_WEEKLY_STALE_MS,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
