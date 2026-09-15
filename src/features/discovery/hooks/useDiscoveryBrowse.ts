import { useInfiniteQuery } from '@tanstack/react-query';
import { getBrowseDiscovery } from '../api/discovery-api';
import { discoveryBrowseInfiniteQueryKey } from './discovery-query-keys';
import type {
  DiscoveryBrowseFilters,
  DiscoveryBrowseMode,
  DiscoveryTypeFilter,
} from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';

export function useDiscoveryBrowse(
  mode: DiscoveryBrowseMode,
  typeFilter: DiscoveryTypeFilter = 'all',
  filters: DiscoveryBrowseFilters,
  pageSize = DEFAULT_DISCOVERY_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: discoveryBrowseInfiniteQueryKey(mode, typeFilter, filters, pageSize),
    queryFn: ({ pageParam, signal }) =>
      getBrowseDiscovery(
        {
          mode,
          type: typeFilter,
          page: pageParam,
          pageSize,
          genreIds: filters.genreIds,
          year: filters.year,
          minRating: filters.minRating,
          language: filters.language,
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
