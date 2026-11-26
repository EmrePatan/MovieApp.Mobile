import { useInfiniteQuery } from '@tanstack/react-query';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
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
  const { region, isHydrated } = useRegionalPreference();
  const filtersByPlatform = state.watchProviderIds.length > 0;
  const watchRegion = filtersByPlatform ? region : undefined;

  return useInfiniteQuery({
    queryKey: worldCinemaInfiniteQueryKey(state, pageSize, watchRegion),
    enabled: !filtersByPlatform || isHydrated,
    queryFn: ({ pageParam, signal }) =>
      getWorldCinema(
        {
          ...state,
          watchRegion,
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
