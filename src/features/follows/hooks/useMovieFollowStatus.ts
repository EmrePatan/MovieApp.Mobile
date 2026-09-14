import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getMovieFollowStatus } from '../api/movie-follow-api';
import { movieFollowStatusQueryKey } from './follow-query-keys';

export function useMovieFollowStatus(movieId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: movieFollowStatusQueryKey(movieId),
    queryFn: ({ signal }) => getMovieFollowStatus(movieId, signal),
    enabled: isAuthenticated && movieId.length > 0,
    staleTime: 30_000,
  });
}
