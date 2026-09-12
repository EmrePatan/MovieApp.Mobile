import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getSeasonProgress } from '../api/watch-history-api';
import { seasonProgressQueryKey } from './watch-history-query-keys';

export function useSeasonProgress(tvShowId: string, seasonNumber: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: seasonProgressQueryKey(tvShowId, seasonNumber),
    queryFn: ({ signal }) => getSeasonProgress(tvShowId, seasonNumber, signal),
    enabled: isAuthenticated && tvShowId.length > 0 && seasonNumber >= 1,
    staleTime: 30_000,
  });
}
