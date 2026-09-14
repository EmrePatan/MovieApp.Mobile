import {
  getRegularSeasonTotals,
  isTvShowFullyWatched,
} from '@/features/watch-history/utils/tv-show-watch-status';
import type { TvShowWatchProgressResponse } from '@/features/watch-history/types';

function buildProgress(
  overrides: Partial<TvShowWatchProgressResponse> = {},
): TvShowWatchProgressResponse {
  return {
    tvShowId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    totalEpisodes: 62,
    watchedEpisodes: 34,
    progressPercentage: 54.84,
    regularTotalEpisodes: 60,
    regularWatchedEpisodes: 34,
    isFullyWatched: false,
    nextEpisode: null,
    seasons: [
      { seasonNumber: 0, totalEpisodes: 2, watchedEpisodes: 0, progressPercentage: 0 },
      { seasonNumber: 1, totalEpisodes: 30, watchedEpisodes: 20, progressPercentage: 66.67 },
      { seasonNumber: 2, totalEpisodes: 30, watchedEpisodes: 14, progressPercentage: 46.67 },
    ],
    ...overrides,
  };
}

describe('tv show watch status helpers', () => {
  it('treats partial regular-season progress as inactive', () => {
    const progress = buildProgress();

    expect(getRegularSeasonTotals(progress)).toEqual({
      regularTotalEpisodes: 60,
      regularWatchedEpisodes: 34,
    });
    expect(isTvShowFullyWatched(progress)).toBe(false);
  });

  it('treats all regular seasons watched as active even when season zero is unwatched', () => {
    const progress = buildProgress({
      watchedEpisodes: 62,
      regularWatchedEpisodes: 60,
      isFullyWatched: true,
      seasons: [
        { seasonNumber: 0, totalEpisodes: 2, watchedEpisodes: 0, progressPercentage: 0 },
        { seasonNumber: 1, totalEpisodes: 30, watchedEpisodes: 30, progressPercentage: 100 },
        { seasonNumber: 2, totalEpisodes: 30, watchedEpisodes: 30, progressPercentage: 100 },
      ],
    });

    expect(isTvShowFullyWatched(progress)).toBe(true);
  });

  it('falls back to season breakdown when regular aggregate fields are absent', () => {
    const progress = buildProgress({
      regularTotalEpisodes: undefined as never,
      regularWatchedEpisodes: undefined as never,
      isFullyWatched: undefined as never,
      seasons: [
        { seasonNumber: 1, totalEpisodes: 10, watchedEpisodes: 10, progressPercentage: 100 },
        { seasonNumber: 2, totalEpisodes: 5, watchedEpisodes: 5, progressPercentage: 100 },
      ],
    });

    expect(isTvShowFullyWatched(progress)).toBe(true);
  });
});
