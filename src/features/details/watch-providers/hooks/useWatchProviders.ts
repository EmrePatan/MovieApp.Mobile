import { useQuery } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import {
  DEFAULT_WATCH_PROVIDER_REGION,
  getMovieWatchProviders,
  getTvShowWatchProviders,
} from '../api/watch-providers-api';
import { movieWatchProvidersQueryKey, tvWatchProvidersQueryKey } from './watch-providers-query-keys';

const WATCH_PROVIDERS_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export function useMovieWatchProviders(movieId: string, region = DEFAULT_WATCH_PROVIDER_REGION) {
  return useQuery({
    queryKey: movieWatchProvidersQueryKey(movieId, region),
    queryFn: ({ signal }) => getMovieWatchProviders(movieId, region, signal),
    enabled: isValidGuid(movieId),
    staleTime: WATCH_PROVIDERS_STALE_TIME_MS,
    retry: 1,
  });
}

export function useTvShowWatchProviders(tvShowId: string, region = DEFAULT_WATCH_PROVIDER_REGION) {
  return useQuery({
    queryKey: tvWatchProvidersQueryKey(tvShowId, region),
    queryFn: ({ signal }) => getTvShowWatchProviders(tvShowId, region, signal),
    enabled: isValidGuid(tvShowId),
    staleTime: WATCH_PROVIDERS_STALE_TIME_MS,
    retry: 1,
  });
}
