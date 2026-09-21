import type { QueryClient } from '@tanstack/react-query';
import type { UpsertTvShowFollowRequest } from '../types';
import {
  commitMovieFollowStatus,
  commitTvShowFollowStatus,
} from './follow-mutation-cache';
import {
  readMovieFollowStatusWithRetry,
  readMovieUnfollowedStatusWithRetry,
  readTvShowFollowStatusWithRetry,
  readTvShowUnfollowedStatusWithRetry,
} from './retry-follow-status-read';

export async function verifyTvShowUnfollowed(
  queryClient: QueryClient,
  tvShowId: string,
): Promise<boolean> {
  const status = await readTvShowUnfollowedStatusWithRetry(tvShowId);
  if (!status) {
    return false;
  }

  commitTvShowFollowStatus(queryClient, tvShowId, status);
  return true;
}

export async function verifyTvShowFollowPreferences(
  queryClient: QueryClient,
  tvShowId: string,
  request: UpsertTvShowFollowRequest,
): Promise<boolean> {
  const status = await readTvShowFollowStatusWithRetry(tvShowId);
  if (!status?.isFollowing) {
    return false;
  }

  const notifyNewSeasons = request.notifyNewSeasons ?? status.notifyNewSeasons;
  const notifyNewEpisodes = request.notifyNewEpisodes ?? status.notifyNewEpisodes;
  const matches =
    status.notifyNewSeasons === notifyNewSeasons &&
    status.notifyNewEpisodes === notifyNewEpisodes;

  if (!matches) {
    return false;
  }

  commitTvShowFollowStatus(queryClient, tvShowId, status);
  return true;
}

export async function verifyMovieUnfollowed(
  queryClient: QueryClient,
  movieId: string,
): Promise<boolean> {
  const status = await readMovieUnfollowedStatusWithRetry(movieId);
  if (!status) {
    return false;
  }

  commitMovieFollowStatus(queryClient, movieId, status);
  return true;
}

export async function verifyMovieFollowed(
  queryClient: QueryClient,
  movieId: string,
): Promise<boolean> {
  const status = await readMovieFollowStatusWithRetry(movieId);
  if (!status?.isFollowing) {
    return false;
  }

  commitMovieFollowStatus(queryClient, movieId, status);
  return true;
}
