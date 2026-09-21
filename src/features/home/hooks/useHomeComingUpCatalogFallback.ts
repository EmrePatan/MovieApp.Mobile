import { useQuery } from '@tanstack/react-query';
import { getUpcomingCatalog } from '@/features/upcoming/api/upcoming-api';

export const HOME_COMING_UP_RAIL_SIZE = 5;

export function useHomeComingUpCatalogFallback(enabled: boolean) {
  return useQuery({
    queryKey: ['home', 'coming-up-catalog-fallback', HOME_COMING_UP_RAIL_SIZE],
    queryFn: ({ signal }) =>
      getUpcomingCatalog(
        {
          scope: 'catalog',
          page: 1,
          pageSize: HOME_COMING_UP_RAIL_SIZE,
        },
        signal,
      ),
    enabled,
    staleTime: 60_000,
  });
}
