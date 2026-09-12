import { useInfiniteQuery } from '@tanstack/react-query';
import { getPopularDiscovery, getTrendingDiscovery } from '../api/discovery-api';
import { discoveryInfiniteQueryKey } from './discovery-query-keys';
import type { DiscoveryKind, DiscoveryTypeFilter } from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';

function fetchDiscovery(
  kind: DiscoveryKind,
  type: DiscoveryTypeFilter,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) {
  const criteria = { type, page, pageSize };

  return kind === 'popular'
    ? getPopularDiscovery(criteria, signal)
    : getTrendingDiscovery(criteria, signal);
}

export function useDiscoveryResults(
  kind: DiscoveryKind,
  typeFilter: DiscoveryTypeFilter = 'all',
  pageSize = DEFAULT_DISCOVERY_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: discoveryInfiniteQueryKey(kind, typeFilter, pageSize),
    queryFn: ({ pageParam, signal }) =>
      fetchDiscovery(kind, typeFilter, pageParam, pageSize, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
