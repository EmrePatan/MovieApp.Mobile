import { useInfiniteQuery } from '@tanstack/react-query';
import { getAdvancedDiscover } from '../api/discovery-api';
import { DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE } from '../advanced-discover-types';
import type { StreamingDiscoverState } from '../streaming-discover-types';
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
        {
          mediaType: state.mediaType,
          page: pageParam,
          pageSize,
          genreIds: [],
          year: null,
          yearFrom: null,
          yearTo: null,
          minRating: state.minRating,
          minRuntimeMinutes: null,
          maxRuntimeMinutes: null,
          originalLanguage: null,
          originCountry: null,
          watchRegion: state.watchRegion,
          watchProviderIds: state.watchProviderIds,
          watchMonetizationTypes: state.watchMonetizationTypes,
          sort: state.sort,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
