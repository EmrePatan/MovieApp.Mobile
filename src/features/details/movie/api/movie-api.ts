import { api } from '@/api/client';
import { buildMovieDetailsByTmdbPath, buildMovieDetailsPath } from '../../shared/routes';
import type { MovieDetailsResponse } from '../types';

export async function getMovieDetails(
  id: string,
  signal?: AbortSignal,
): Promise<MovieDetailsResponse> {
  return api.get<MovieDetailsResponse>(buildMovieDetailsPath(id), {
    authenticated: false,
    signal,
  });
}

export async function getMovieDetailsByTmdbId(
  tmdbId: number,
  signal?: AbortSignal,
): Promise<MovieDetailsResponse> {
  return api.get<MovieDetailsResponse>(buildMovieDetailsByTmdbPath(tmdbId), {
    authenticated: false,
    signal,
  });
}
