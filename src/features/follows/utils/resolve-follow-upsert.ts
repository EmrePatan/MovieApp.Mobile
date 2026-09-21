import { upsertTvShowFollow } from '../api/follow-api';
import type { TvShowFollowStatusResponse, UpsertTvShowFollowRequest } from '../types';
import { readTvShowFollowStatusWithRetry } from './retry-follow-status-read';

function matchesRequestedPreferences(
  status: TvShowFollowStatusResponse,
  request: UpsertTvShowFollowRequest,
): boolean {
  const notifyNewSeasons = request.notifyNewSeasons ?? status.notifyNewSeasons;
  const notifyNewEpisodes = request.notifyNewEpisodes ?? status.notifyNewEpisodes;

  return (
    status.isFollowing &&
    status.notifyNewSeasons === notifyNewSeasons &&
    status.notifyNewEpisodes === notifyNewEpisodes
  );
}

export async function resolveTvShowFollowUpsert(
  tvShowId: string,
  request: UpsertTvShowFollowRequest,
): Promise<TvShowFollowStatusResponse> {
  try {
    return await upsertTvShowFollow(tvShowId, request);
  } catch (error) {
    const status = await readTvShowFollowStatusWithRetry(tvShowId);
    if (status && matchesRequestedPreferences(status, request)) {
      return status;
    }

    throw error;
  }
}
