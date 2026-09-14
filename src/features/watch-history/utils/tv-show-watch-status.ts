import type { TvShowWatchProgressResponse } from '../types';

export function getRegularSeasonTotals(progress: TvShowWatchProgressResponse | undefined) {
  if (!progress) {
    return { regularTotalEpisodes: 0, regularWatchedEpisodes: 0 };
  }

  if (progress.regularTotalEpisodes != null && progress.regularWatchedEpisodes != null) {
    return {
      regularTotalEpisodes: progress.regularTotalEpisodes,
      regularWatchedEpisodes: progress.regularWatchedEpisodes,
    };
  }

  const regularSeasons = (progress.seasons ?? []).filter((season) => season.seasonNumber >= 1);
  return {
    regularTotalEpisodes: regularSeasons.reduce((sum, season) => sum + season.totalEpisodes, 0),
    regularWatchedEpisodes: regularSeasons.reduce((sum, season) => sum + season.watchedEpisodes, 0),
  };
}

export function isTvShowFullyWatched(progress: TvShowWatchProgressResponse | undefined): boolean {
  if (!progress) {
    return false;
  }

  if (typeof progress.isFullyWatched === 'boolean') {
    return progress.isFullyWatched;
  }

  const { regularTotalEpisodes, regularWatchedEpisodes } = getRegularSeasonTotals(progress);
  return regularTotalEpisodes > 0 && regularWatchedEpisodes >= regularTotalEpisodes;
}
