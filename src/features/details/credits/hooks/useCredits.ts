import { useQuery } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import { getMovieCredits, getTvShowCredits } from '../api/credits-api';
import { movieCreditsQueryKey, tvCreditsQueryKey } from './credits-query-keys';

const CREDITS_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export function useMovieCredits(movieId: string) {
  return useQuery({
    queryKey: movieCreditsQueryKey(movieId),
    queryFn: ({ signal }) => getMovieCredits(movieId, signal),
    enabled: isValidGuid(movieId),
    staleTime: CREDITS_STALE_TIME_MS,
    retry: 1,
  });
}

export function useTvShowCredits(tvShowId: string) {
  return useQuery({
    queryKey: tvCreditsQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvShowCredits(tvShowId, signal),
    enabled: isValidGuid(tvShowId),
    staleTime: CREDITS_STALE_TIME_MS,
    retry: 1,
  });
}
