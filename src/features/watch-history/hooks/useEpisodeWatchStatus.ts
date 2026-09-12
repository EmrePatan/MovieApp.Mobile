import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getEpisodeWatchStatus } from '../api/watch-history-api';
import { episodeWatchStatusQueryKey } from './watch-history-query-keys';

export function useEpisodeWatchStatus(episodeId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: episodeWatchStatusQueryKey(episodeId),
    queryFn: ({ signal }) => getEpisodeWatchStatus(episodeId, signal),
    enabled: isAuthenticated && episodeId.length > 0,
    staleTime: 30_000,
  });
}
