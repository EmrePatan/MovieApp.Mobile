import type { QueryClient } from '@tanstack/react-query';
import type { TvShowSeasonProgressResponse, TvShowWatchProgressResponse } from '../types';
import { tvShowProgressQueryKey } from '../hooks/watch-history-query-keys';
import { calculateSeasonProgressPercentage } from './season-progress';

export type SeasonProgressLookup = ReadonlyMap<number, TvShowSeasonProgressResponse>;

export function buildSeasonProgressMap(
  seasons: TvShowSeasonProgressResponse[] | undefined,
): SeasonProgressLookup {
  return new Map((seasons ?? []).map((season) => [season.seasonNumber, season]));
}

function recalculateAggregate(
  seasons: TvShowSeasonProgressResponse[],
): Pick<
  TvShowWatchProgressResponse,
  | 'seasons'
  | 'totalEpisodes'
  | 'watchedEpisodes'
  | 'progressPercentage'
  | 'regularTotalEpisodes'
  | 'regularWatchedEpisodes'
  | 'isFullyWatched'
> {
  const totalEpisodes = seasons.reduce((sum, season) => sum + season.totalEpisodes, 0);
  const watchedEpisodes = seasons.reduce((sum, season) => sum + season.watchedEpisodes, 0);
  const regularSeasons = seasons.filter((season) => season.seasonNumber >= 1);
  const regularTotalEpisodes = regularSeasons.reduce((sum, season) => sum + season.totalEpisodes, 0);
  const regularWatchedEpisodes = regularSeasons.reduce(
    (sum, season) => sum + season.watchedEpisodes,
    0,
  );

  return {
    seasons,
    totalEpisodes,
    watchedEpisodes,
    progressPercentage: calculateSeasonProgressPercentage(watchedEpisodes, totalEpisodes),
    regularTotalEpisodes,
    regularWatchedEpisodes,
    isFullyWatched:
      regularTotalEpisodes > 0 && regularWatchedEpisodes >= regularTotalEpisodes,
  };
}

export function updateTvShowAggregateSeasonProgress(
  queryClient: QueryClient,
  tvShowId: string,
  seasonNumber: number,
  watchedEpisodes: number,
  totalEpisodes?: number,
) {
  const key = tvShowProgressQueryKey(tvShowId);
  const current = queryClient.getQueryData<TvShowWatchProgressResponse>(key);
  if (!current) {
    return;
  }

  const seasons = [...(current.seasons ?? [])];
  const index = seasons.findIndex((season) => season.seasonNumber === seasonNumber);
  const resolvedTotal = totalEpisodes ?? seasons[index]?.totalEpisodes ?? watchedEpisodes;
  const nextSeason: TvShowSeasonProgressResponse = {
    seasonNumber,
    totalEpisodes: resolvedTotal,
    watchedEpisodes,
    progressPercentage: calculateSeasonProgressPercentage(watchedEpisodes, resolvedTotal),
  };

  if (index >= 0) {
    seasons[index] = nextSeason;
  } else {
    seasons.push(nextSeason);
    seasons.sort((left, right) => left.seasonNumber - right.seasonNumber);
  }

  queryClient.setQueryData<TvShowWatchProgressResponse>(key, {
    ...current,
    ...recalculateAggregate(seasons),
  });
}

export function updateTvShowAggregateAllSeasonsWatched(
  queryClient: QueryClient,
  tvShowId: string,
  fullyWatched: boolean,
) {
  const key = tvShowProgressQueryKey(tvShowId);
  const current = queryClient.getQueryData<TvShowWatchProgressResponse>(key);
  if (!current?.seasons?.length) {
    if (!current) {
      return;
    }

    const seasons = (current.seasons ?? []).map((season) =>
      season.seasonNumber < 1
        ? season
        : {
            ...season,
            watchedEpisodes: fullyWatched ? season.totalEpisodes : 0,
            progressPercentage: fullyWatched
              ? calculateSeasonProgressPercentage(season.totalEpisodes, season.totalEpisodes)
              : 0,
          },
    );

    queryClient.setQueryData<TvShowWatchProgressResponse>(key, {
      ...current,
      ...recalculateAggregate(seasons),
    });
    return;
  }

  const seasons = current.seasons.map((season) =>
    season.seasonNumber < 1
      ? season
      : {
          ...season,
          watchedEpisodes: fullyWatched ? season.totalEpisodes : 0,
          progressPercentage: fullyWatched
            ? calculateSeasonProgressPercentage(season.totalEpisodes, season.totalEpisodes)
            : 0,
        },
  );

  queryClient.setQueryData<TvShowWatchProgressResponse>(key, {
    ...current,
    ...recalculateAggregate(seasons),
  });
}
