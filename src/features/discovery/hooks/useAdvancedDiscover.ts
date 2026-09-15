import { useInfiniteQuery } from '@tanstack/react-query';
import { getAdvancedDiscover } from '../api/discovery-api';
import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
} from '../advanced-discover-types';
import { DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE } from '../advanced-discover-types';
import { advancedDiscoverInfiniteQueryKey } from './discovery-query-keys';

export function useAdvancedDiscover(
  mediaType: AdvancedDiscoverMediaType,
  filters: AdvancedDiscoverFilters,
  pageSize = DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: advancedDiscoverInfiniteQueryKey(mediaType, filters, pageSize),
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
          watchRegion: filters.watchRegion,
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
