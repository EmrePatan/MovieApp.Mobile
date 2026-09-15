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
) {
  const { region, isHydrated } = useRegionalPreference();
  const effectiveWatchRegion = resolveAdvancedDiscoverWatchRegion(filters, region);

  return useInfiniteQuery({
    queryKey: advancedDiscoverInfiniteQueryKey(mediaType, filters, pageSize, region),
    enabled: isHydrated,
    queryFn: ({ pageParam, signal }) =>
      getAdvancedDiscover(
        {
          mediaType,
          page: pageParam,
          pageSize,
          genreIds: filters.genreIds,
          year: filters.year,
          yearFrom: filters.yearFrom,
          yearTo: filters.yearTo,
          minRating: filters.minRating,
          minRuntimeMinutes: filters.minRuntimeMinutes,
          maxRuntimeMinutes: filters.maxRuntimeMinutes,
          originalLanguage: filters.originalLanguage,
          originCountry: filters.originCountry,
          watchRegion: effectiveWatchRegion,
          watchProviderIds: filters.watchProviderIds,
          watchMonetizationTypes: filters.watchMonetizationTypes,
          sort: filters.sort,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
