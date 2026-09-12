import { useQuery } from '@tanstack/react-query';
import { getSimilarMovies } from '../api/recommendations-api';
import { similarMoviesQueryKey } from './recommendation-query-keys';
import { DEFAULT_RECOMMENDATION_PAGE_SIZE } from '../types';

export function useSimilarMovies(movieId: string, pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE) {
  return useQuery({
    queryKey: similarMoviesQueryKey(movieId, pageSize),
    queryFn: ({ signal }) => getSimilarMovies(movieId, { page: 1, pageSize }, signal),
    enabled: movieId.length > 0,
    staleTime: 120_000,
  });
}
