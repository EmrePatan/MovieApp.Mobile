import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import {
  fetchProviderPreviewsBatchChunked,
  isTransientBatchItemStatus,
  mergeProviderPreviewBatchResponses,
  PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_COUNT,
  PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_DELAY_MS,
} from '../discovery-batch-client';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  STREAMING_HUB_SPOTLIGHT_SIZE,
  STREAMING_HUB_WEEKLY_STALE_MS,
} from '../streaming-platform-hub-types';
import type { DiscoveryWatchProvider } from '../watch-provider-types';
import { getIsoWeekId } from '../utils/iso-week-id';
import {
  streamingProviderPreviewsBatchQueryKey,
  streamingProviderPreviewsBatchRetryQueryKey,
} from './discovery-query-keys';
import type { SearchResultItem } from '@/features/search/types';

function normalizeOrderedProviderIds(providerIds: readonly number[]): number[] {
  const seen = new Set<number>();
  const ordered: number[] = [];

  for (const providerId of providerIds) {
    if (!Number.isFinite(providerId) || providerId <= 0 || seen.has(providerId)) {
      continue;
    }

    seen.add(providerId);
    ordered.push(providerId);
  }

  return ordered;
}

export function useStreamingProviderPreviews(
  providers: readonly DiscoveryWatchProvider[],
  watchRegion: string,
  mediaType: AdvancedDiscoverMediaType = DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  queryEnabled = true,
  pageSize: number = STREAMING_HUB_SPOTLIGHT_SIZE,
) {
  const weekId = getIsoWeekId();
  const orderedProviderIds = useMemo(
    () => normalizeOrderedProviderIds(providers.map((provider) => provider.providerId)),
    [providers],
  );

  const batchRequest = useMemo(
    () => ({
      providerIds: orderedProviderIds,
      mediaType,
      watchRegion,
      pageSize,
    }),
    [mediaType, orderedProviderIds, pageSize, watchRegion],
  );

  const primaryQuery = useQuery({
    queryKey: streamingProviderPreviewsBatchQueryKey(
      orderedProviderIds,
      mediaType,
      watchRegion,
      weekId,
      pageSize,
    ),
    enabled:
      queryEnabled &&
      orderedProviderIds.length > 0 &&
      watchRegion.trim().length > 0,
    queryFn: ({ signal }) => fetchProviderPreviewsBatchChunked(batchRequest, signal),
    staleTime: STREAMING_HUB_WEEKLY_STALE_MS,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });

  const transientProviderIds = useMemo(() => {
    if (!primaryQuery.data) {
      return [];
    }

    return primaryQuery.data.items
      .filter((item) => isTransientBatchItemStatus(item.status))
      .map((item) => item.providerId);
  }, [primaryQuery.data]);

  const retryQuery = useQuery({
    queryKey: streamingProviderPreviewsBatchRetryQueryKey(
      transientProviderIds,
      mediaType,
      watchRegion,
      weekId,
      pageSize,
    ),
    enabled: primaryQuery.isSuccess && transientProviderIds.length > 0,
    staleTime: 0,
    gcTime: 60_000,
    retry: PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_COUNT,
    retryDelay: PROVIDER_PREVIEW_BATCH_TRANSIENT_RETRY_DELAY_MS,
    queryFn: ({ signal }) =>
      fetchProviderPreviewsBatchChunked(
        {
          ...batchRequest,
          providerIds: transientProviderIds,
        },
        signal,
      ),
  });

  const mergedBatch = useMemo(() => {
    if (!primaryQuery.data) {
      return undefined;
    }

    if (!retryQuery.data) {
      return primaryQuery.data;
    }

    return mergeProviderPreviewBatchResponses([primaryQuery.data, retryQuery.data]);
  }, [primaryQuery.data, retryQuery.data]);

  const previewByProviderId = useMemo(() => {
    const map = new Map<number, readonly SearchResultItem[]>();
    for (const item of mergedBatch?.items ?? []) {
      if (isTransientBatchItemStatus(item.status)) {
        continue;
      }

      map.set(item.providerId, item.items);
    }

    return map;
  }, [mergedBatch?.items]);

  const primaryInitialPending = primaryQuery.isLoading && primaryQuery.data === undefined;
  const retryPending =
    transientProviderIds.length > 0 &&
    (retryQuery.isLoading || retryQuery.isFetching);

  const isSpotlightLoading = useCallback(
    (providerId: number): boolean => {
      if (!orderedProviderIds.includes(providerId)) {
        return false;
      }

      if (primaryInitialPending) {
        return true;
      }

      if (transientProviderIds.includes(providerId) && retryPending) {
        return true;
      }

      return false;
    },
    [orderedProviderIds, primaryInitialPending, retryPending, transientProviderIds],
  );

  return {
    isSpotlightLoading,
    previewByProviderId,
    getSpotlightPosterPath(providerId: number): string | null {
      const spotlight = previewByProviderId.get(providerId)?.[0];
      return spotlight && spotlight.type !== 'person' ? spotlight.posterUrl : null;
    },
  };
}
