import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { loadBatchedTvShowWatchStatus } from '../utils/watch-status-batcher';
import { tvShowCardWatchStatusQueryKey } from './watch-history-query-keys';

/**
 * Poster-card view of a TV show's watch state: "fully watched" without the per-season progress
 * payload. Batched with other cards on screen into one request.
 */
export function useTvShowCardWatchStatus(tvShowId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: tvShowCardWatchStatusQueryKey(tvShowId),
    queryFn: ({ signal }) => loadBatchedTvShowWatchStatus(tvShowId, signal),
    enabled: isAuthenticated && tvShowId.length > 0,
    staleTime: 30_000,
  });
}
