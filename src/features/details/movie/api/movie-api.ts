import { api } from '@/api/client';
import { buildMovieDetailsPath } from '../../shared/routes';
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
