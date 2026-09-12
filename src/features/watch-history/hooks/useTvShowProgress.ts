import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getTvShowProgress } from '../api/watch-history-api';
import { tvShowProgressQueryKey } from './watch-history-query-keys';

export function useTvShowProgress(tvShowId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: tvShowProgressQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvShowProgress(tvShowId, signal),
    enabled: isAuthenticated && tvShowId.length > 0,
    staleTime: 30_000,
  });
}
