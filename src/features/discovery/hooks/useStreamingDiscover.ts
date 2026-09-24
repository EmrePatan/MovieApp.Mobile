import { useInfiniteQuery } from '@tanstack/react-query';
import { getAdvancedDiscover } from '../api/discovery-api';
import { DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE } from '../advanced-discover-types';
import type { StreamingDiscoverState } from '../streaming-discover-types';
import { buildAdvancedDiscoverRequest } from '../utils/build-advanced-discover-request';
import { streamingDiscoverInfiniteQueryKey } from './discovery-query-keys';

export function useStreamingDiscover(
  state: StreamingDiscoverState,
  pageSize = DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
  queryEnabled = true,
) {
  const enabled =
    queryEnabled &&
    state.watchProviderIds.length > 0 &&
    state.watchMonetizationTypes.length > 0;

  return useInfiniteQuery({
    queryKey: streamingDiscoverInfiniteQueryKey(state, pageSize),
    enabled,
    queryFn: ({ pageParam, signal }) =>
      getAdvancedDiscover(
        buildAdvancedDiscoverRequest({
          mediaType: state.mediaType,
          page: pageParam,
          pageSize,
          minRating: state.minRating,
          watchRegion: state.watchRegion,
          watchProviderIds: state.watchProviderIds,
          watchMonetizationTypes: state.watchMonetizationTypes,
          sort: state.sort,
        }),
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
