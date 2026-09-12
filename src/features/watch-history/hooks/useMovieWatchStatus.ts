import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getMovieWatchStatus } from '../api/watch-history-api';
import { movieWatchStatusQueryKey } from './watch-history-query-keys';

export function useMovieWatchStatus(movieId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: movieWatchStatusQueryKey(movieId),
    queryFn: ({ signal }) => getMovieWatchStatus(movieId, signal),
    enabled: isAuthenticated && movieId.length > 0,
    staleTime: 30_000,
  });
}
