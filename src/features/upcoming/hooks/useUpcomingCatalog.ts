import { useInfiniteQuery } from '@tanstack/react-query';
import { getUpcomingCatalog } from '../api/upcoming-api';
import { upcomingCatalogInfiniteQueryKey } from './upcoming-query-keys';
import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export function useUpcomingCatalog(pageSize = DEFAULT_UPCOMING_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: upcomingCatalogInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) =>
      getUpcomingCatalog({ page: pageParam, pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
  });
}
