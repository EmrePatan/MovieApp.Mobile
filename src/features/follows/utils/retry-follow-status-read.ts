import { getTvShowFollowStatus } from '../api/follow-api';
import { getMovieFollowStatus } from '../api/movie-follow-api';
import type { MovieFollowStatusResponse, TvShowFollowStatusResponse } from '../types';

const FOLLOW_STATUS_RECONCILE_ATTEMPTS = 6;
const FOLLOW_STATUS_RECONCILE_DELAY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readUntilMatch<T>(
  read: () => Promise<T>,
  isMatch: (value: T) => boolean,
  attempts = FOLLOW_STATUS_RECONCILE_ATTEMPTS,
): Promise<T | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const value = await read();
      if (isMatch(value)) {
        return value;
      }
    } catch {
      // Retry when the follow status read fails transiently.
    }

    if (attempt < attempts - 1) {
      await delay(FOLLOW_STATUS_RECONCILE_DELAY_MS);
    }
  }

  return null;
}

export async function readTvShowFollowStatusWithRetry(
  tvShowId: string,
): Promise<TvShowFollowStatusResponse | null> {
  return readUntilMatch(
    () => getTvShowFollowStatus(tvShowId),
    () => true,
  );
}

export async function readTvShowUnfollowedStatusWithRetry(
  tvShowId: string,
): Promise<TvShowFollowStatusResponse | null> {
  return readUntilMatch(
    () => getTvShowFollowStatus(tvShowId),
    (status) => !status.isFollowing,
  );
}

export async function readMovieFollowStatusWithRetry(
  movieId: string,
): Promise<MovieFollowStatusResponse | null> {
  return readUntilMatch(
    () => getMovieFollowStatus(movieId),
    () => true,
  );
}

export async function readMovieUnfollowedStatusWithRetry(
  movieId: string,
): Promise<MovieFollowStatusResponse | null> {
  return readUntilMatch(
    () => getMovieFollowStatus(movieId),
    (status) => !status.isFollowing,
  );
}
