import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getMovieWatchStatus } from '../api/watch-history-api';
import { loadBatchedMovieWatchStatus } from '../utils/watch-status-batcher';
import { movieWatchStatusQueryKey } from './watch-history-query-keys';

interface UseMovieWatchStatusOptions {
  enabled?: boolean;
  /**
   * Poster cards pass true so a screen full of cards shares one request. Same query key and
   * response shape as the single request, so detail screens and mutations are unaffected.
   */
  batched?: boolean;
}

export function useMovieWatchStatus(
  movieId: string,
  options?: UseMovieWatchStatusOptions,
) {
  const { isAuthenticated } = useAuth();
  const batched = options?.batched === true;

  return useQuery({
    queryKey: movieWatchStatusQueryKey(movieId),
    queryFn: ({ signal }) =>
      batched
        ? loadBatchedMovieWatchStatus(movieId, signal)
        : getMovieWatchStatus(movieId, signal),
    enabled:
      isAuthenticated && movieId.length > 0 && (options?.enabled ?? true),
    staleTime: 30_000,
  });
}
