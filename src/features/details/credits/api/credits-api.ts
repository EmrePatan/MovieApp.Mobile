import { api } from '@/api/client';
import { buildMovieCreditsPath, buildTvShowCreditsPath } from './routes';
import type { CreditsResponse } from '../types';

export async function getMovieCredits(
  movieId: string,
  signal?: AbortSignal,
): Promise<CreditsResponse> {
  return api.get<CreditsResponse>(buildMovieCreditsPath(movieId), {
    authenticated: false,
    signal,
  });
}

export async function getTvShowCredits(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<CreditsResponse> {
  return api.get<CreditsResponse>(buildTvShowCreditsPath(tvShowId), {
    authenticated: false,
    signal,
  });
}
