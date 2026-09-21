import { createMovieFollow } from '../api/movie-follow-api';
import type { MovieFollowStatusResponse } from '../types';
import { readMovieFollowStatusWithRetry } from './retry-follow-status-read';

export async function resolveMovieFollowUpsert(
  movieId: string,
): Promise<MovieFollowStatusResponse> {
  try {
    return await createMovieFollow(movieId);
  } catch (error) {
    const status = await readMovieFollowStatusWithRetry(movieId);
    if (status?.isFollowing) {
      return status;
    }

    throw error;
  }
}
