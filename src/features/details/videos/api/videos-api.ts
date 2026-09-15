import { api } from '@/api/client';
import { buildMovieVideosPath, buildTvShowVideosPath } from './routes';
import type { VideosResponse } from '../types';

export async function getMovieVideos(
  movieId: string,
  signal?: AbortSignal,
): Promise<VideosResponse> {
  return api.get<VideosResponse>(buildMovieVideosPath(movieId), {
    authenticated: false,
    signal,
  });
}

export async function getTvShowVideos(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<VideosResponse> {
  return api.get<VideosResponse>(buildTvShowVideosPath(tvShowId), {
    authenticated: false,
    signal,
  });
}
