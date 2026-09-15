import { useInfiniteQuery } from '@tanstack/react-query';
import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';
import { getUpcomingCatalog } from '../api/upcoming-api';
import { upcomingCatalogInfiniteQueryKey } from './upcoming-query-keys';
import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export function useUpcomingCatalog(pageSize = DEFAULT_UPCOMING_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: upcomingCatalogInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) =>
      getUpcomingCatalog({ page: pageParam, pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: getCatalogNextPageParam,
    staleTime: 60_000,
  });
}
