import { useInfiniteQuery } from '@tanstack/react-query';
import { getOnTvThisWeek } from '../api/discovery-api';
import { DEFAULT_ON_TV_THIS_WEEK_PAGE_SIZE } from '../on-tv-this-week-types';
import { onTvThisWeekInfiniteQueryKey } from './discovery-query-keys';

export function useOnTvThisWeek(pageSize = DEFAULT_ON_TV_THIS_WEEK_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: onTvThisWeekInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) =>
      getOnTvThisWeek(
        {
          page: pageParam,
          pageSize,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 120_000,
  });
}
