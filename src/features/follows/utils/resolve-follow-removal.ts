import { removeMovieFollow } from '../api/movie-follow-api';
import { removeTvShowFollow } from '../api/follow-api';
import type { MovieFollowStatusResponse, TvShowFollowStatusResponse } from '../types';
import {
  createUnfollowedMovieFollowStatus,
  createUnfollowedTvFollowStatus,
} from './follow-status-defaults';
import {
  readMovieUnfollowedStatusWithRetry,
  readTvShowUnfollowedStatusWithRetry,
} from './retry-follow-status-read';

export async function resolveTvShowFollowRemoval(
  tvShowId: string,
): Promise<TvShowFollowStatusResponse> {
  try {
    await removeTvShowFollow(tvShowId);
    return createUnfollowedTvFollowStatus();
  } catch (error) {
    const status = await readTvShowUnfollowedStatusWithRetry(tvShowId);
    if (status) {
      return status;
    }

    throw error;
  }
}

export async function resolveMovieFollowRemoval(
  movieId: string,
): Promise<MovieFollowStatusResponse> {
  try {
    await removeMovieFollow(movieId);
    return createUnfollowedMovieFollowStatus();
  } catch (error) {
    const status = await readMovieUnfollowedStatusWithRetry(movieId);
    if (status) {
      return status;
    }

    throw error;
  }
}
