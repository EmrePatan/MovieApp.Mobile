import { api } from '@/api/client';
import {
  buildMovieWatchProvidersPath,
  buildTvShowWatchProvidersPath,
} from './routes';
import type { WatchProvidersResponse } from '../types';

export const DEFAULT_WATCH_PROVIDER_REGION = 'TR';

export async function getMovieWatchProviders(
  movieId: string,
  region = DEFAULT_WATCH_PROVIDER_REGION,
  signal?: AbortSignal,
): Promise<WatchProvidersResponse> {
  return api.get<WatchProvidersResponse>(buildMovieWatchProvidersPath(movieId, region), {
    authenticated: false,
    signal,
  });
}

export async function getTvShowWatchProviders(
  tvShowId: string,
  region = DEFAULT_WATCH_PROVIDER_REGION,
  signal?: AbortSignal,
): Promise<WatchProvidersResponse> {
  return api.get<WatchProvidersResponse>(buildTvShowWatchProvidersPath(tvShowId, region), {
    authenticated: false,
    signal,
  });
}
