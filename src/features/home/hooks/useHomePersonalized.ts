import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getHomePersonalized } from '../api/home-api';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { HOME_QUERY_KEY_ROOT } from './home-query-keys';

export function homePersonalizedQueryKey(
  type: HomeTypeFilter,
  sectionSize: number,
  releaseRegion: string,
) {
  return [...HOME_QUERY_KEY_ROOT, 'personalized', type, sectionSize, releaseRegion] as const;
}

export function useHomePersonalized(type: HomeTypeFilter, sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  const { isAuthenticated, isSessionRestored } = useAuth();
  const { region, isHydrated } = useRegionalPreference();

  return useQuery({
    queryKey: homePersonalizedQueryKey(type, sectionSize, region),
    queryFn: ({ signal }) =>
      getHomePersonalized({ type, sectionSize, releaseRegion: region }, signal),
    staleTime: 60_000,
    enabled: isSessionRestored && isAuthenticated && isHydrated,
  });
}
