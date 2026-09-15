import { useInfiniteQuery } from '@tanstack/react-query';
import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';
import { getUpcomingCatalog } from '../api/upcoming-api';
import { upcomingCatalogInfiniteQueryKey } from './upcoming-query-keys';
import { DEFAULT_UPCOMING_PAGE_SIZE, type UpcomingCatalogScope } from '../types';

interface UseUpcomingCatalogOptions {
  enabled?: boolean;
}

export function useUpcomingCatalog(
  scope: UpcomingCatalogScope,
  pageSize = DEFAULT_UPCOMING_PAGE_SIZE,
  options: UseUpcomingCatalogOptions = {},
) {
  const { enabled = true } = options;

  return useInfiniteQuery({
    queryKey: upcomingCatalogInfiniteQueryKey(pageSize, scope),
    queryFn: ({ pageParam, signal }) =>
      getUpcomingCatalog({ page: pageParam, pageSize, scope }, signal),
    initialPageParam: 1,
    getNextPageParam: getCatalogNextPageParam,
    staleTime: 60_000,
    enabled,
  });
}
