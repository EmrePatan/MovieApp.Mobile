import { useInfiniteQuery } from '@tanstack/react-query';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getAdvancedDiscover } from '../api/discovery-api';
import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
} from '../advanced-discover-types';
import {
  DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
  resolveAdvancedDiscoverWatchRegion,
} from '../advanced-discover-types';
import { advancedDiscoverInfiniteQueryKey } from './discovery-query-keys';

export function useAdvancedDiscover(
  mediaType: AdvancedDiscoverMediaType,
  filters: AdvancedDiscoverFilters,
  pageSize = DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
  enabled = true,
) {
  const { region, isHydrated } = useRegionalPreference();
  const effectiveWatchRegion = resolveAdvancedDiscoverWatchRegion(filters, region);

  return useInfiniteQuery({
    queryKey: advancedDiscoverInfiniteQueryKey(mediaType, filters, pageSize, region),
    enabled: enabled && isHydrated,
    queryFn: ({ pageParam, signal }) =>
      getAdvancedDiscover(
        {
          ...filters,
          mediaType,
          page: pageParam,
          pageSize,
          watchRegion: effectiveWatchRegion,
          tvStatuses: mediaType === 'tv' ? filters.tvStatuses : [],
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
