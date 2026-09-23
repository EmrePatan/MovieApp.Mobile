import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getUpcomingCatalog } from '@/features/upcoming/api/upcoming-api';

export const HOME_COMING_UP_RAIL_SIZE = 5;

export function useHomeComingUpCatalogFallback(enabled: boolean) {
  const { isAuthenticated, isSessionRestored } = useAuth();
  const { region, isHydrated } = useRegionalPreference();

  return useQuery({
    queryKey: ['home', 'coming-up-catalog-fallback', HOME_COMING_UP_RAIL_SIZE, region],
    queryFn: ({ signal }) =>
      getUpcomingCatalog(
        {
          scope: 'catalog',
          page: 1,
          pageSize: HOME_COMING_UP_RAIL_SIZE,
          releaseRegion: region,
        },
        signal,
      ),
    enabled: enabled && isSessionRestored && isAuthenticated && isHydrated,
    staleTime: 60_000,
  });
}
