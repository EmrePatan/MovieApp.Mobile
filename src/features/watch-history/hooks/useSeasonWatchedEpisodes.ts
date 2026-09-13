import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getSeasonWatchedEpisodes } from '../api/watch-history-api';
import { seasonWatchedEpisodesQueryKey } from './watch-history-query-keys';

export function useSeasonWatchedEpisodes(tvShowId: string, seasonNumber: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
    queryFn: ({ signal }) => getSeasonWatchedEpisodes(tvShowId, seasonNumber, signal),
    enabled: isAuthenticated && Boolean(tvShowId) && seasonNumber > 0,
    staleTime: 30_000,
  });
}
