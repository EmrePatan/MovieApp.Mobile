import { useInfiniteQuery } from '@tanstack/react-query';
import { getWorldCinema } from '../api/discovery-api';
import {
  DEFAULT_WORLD_CINEMA_PAGE_SIZE,
  type WorldCinemaState,
} from '../world-cinema-types';
import { worldCinemaInfiniteQueryKey } from './discovery-query-keys';

export function useWorldCinema(
  state: WorldCinemaState,
  pageSize = DEFAULT_WORLD_CINEMA_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: worldCinemaInfiniteQueryKey(state, pageSize),
    queryFn: ({ pageParam, signal }) =>
      getWorldCinema(
        {
          ...state,
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
