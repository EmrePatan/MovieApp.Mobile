import { api } from '@/api/client';
import { buildMovieFollowStatusPath } from './routes';
import type { MovieFollowStatusResponse } from '../types';

export async function getMovieFollowStatus(
  movieId: string,
  signal?: AbortSignal,
): Promise<MovieFollowStatusResponse> {
  return api.get<MovieFollowStatusResponse>(buildMovieFollowStatusPath(movieId), { signal });
}

export async function createMovieFollow(movieId: string): Promise<MovieFollowStatusResponse> {
  return api.put<MovieFollowStatusResponse>(buildMovieFollowStatusPath(movieId));
}

export async function removeMovieFollow(movieId: string): Promise<void> {
  await api.delete<void>(buildMovieFollowStatusPath(movieId));
}
