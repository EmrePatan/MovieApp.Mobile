import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getHomePersonalized } from '../api/home-api';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { HOME_QUERY_KEY_ROOT } from './home-query-keys';

export function homePersonalizedQueryKey(type: HomeTypeFilter, sectionSize: number) {
  return [...HOME_QUERY_KEY_ROOT, 'personalized', type, sectionSize] as const;
}

export function useHomePersonalized(type: HomeTypeFilter, sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  const { isAuthenticated, isSessionRestored } = useAuth();

  return useQuery({
    queryKey: homePersonalizedQueryKey(type, sectionSize),
    queryFn: ({ signal }) => getHomePersonalized({ type, sectionSize }, signal),
    staleTime: 60_000,
    enabled: isSessionRestored && isAuthenticated,
  });
}
