import { useInfiniteQuery } from '@tanstack/react-query';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
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
  const { region, isHydrated } = useRegionalPreference();
  const filtersByPlatform = filters.watchProviderIds.length > 0;
  const watchRegion = filtersByPlatform ? region : undefined;

  return useInfiniteQuery({
    queryKey: discoveryBrowseInfiniteQueryKey(mode, typeFilter, filters, pageSize, watchRegion),
    enabled: !filtersByPlatform || isHydrated,
    queryFn: ({ pageParam, signal }) =>
      getBrowseDiscovery(
        {
          mode,
          type: typeFilter,
          page: pageParam,
          pageSize,
          ...filters,
          watchRegion,
          tvStatuses: typeFilter === 'movie' ? [] : filters.tvStatuses,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
