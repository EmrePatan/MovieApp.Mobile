import { useInfiniteQuery } from '@tanstack/react-query';
import { getNowInTheaters } from '../api/discovery-api';
import {
  DEFAULT_NOW_IN_THEATERS_PAGE_SIZE,
  type NowInTheatersState,
} from '../now-in-theaters-types';
import { nowInTheatersInfiniteQueryKey } from './discovery-query-keys';

export function useNowInTheaters(
  state: NowInTheatersState,
  pageSize = DEFAULT_NOW_IN_THEATERS_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: nowInTheatersInfiniteQueryKey(state, pageSize),
    enabled,
    queryFn: ({ pageParam, signal }) =>
      getNowInTheaters(
        {
          releaseRegion: state.releaseRegion,
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
