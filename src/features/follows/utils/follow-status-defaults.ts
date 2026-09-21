import type { MovieFollowStatusResponse, TvShowFollowStatusResponse } from '../types';

export function createUnfollowedTvFollowStatus(): TvShowFollowStatusResponse {
  return {
    isFollowing: false,
    notifyNewSeasons: true,
    notifyNewEpisodes: true,
    baselineEstablished: false,
  };
}

export function createUnfollowedMovieFollowStatus(): MovieFollowStatusResponse {
  return { isFollowing: false };
}
