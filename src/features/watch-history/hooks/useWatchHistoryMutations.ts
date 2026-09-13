import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeason } from '@/features/details/season/api/season-api';
import {
  bulkUpdateEpisodeWatchState,
  bulkUpdateTvShowWatchState,
  markEpisodeWatched,
  markMovieWatched,
  markThroughEpisode,
  unmarkEpisodeWatched,
  unmarkMovieWatched,
} from '../api/watch-history-api';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  seasonProgressQueryKey,
  seasonWatchedEpisodesQueryKey,
  tvShowProgressQueryKey,
} from './watch-history-query-keys';
import type {
  EpisodeWatchStatusResponse,
  MovieWatchStatusResponse,
  SeasonWatchProgressResponse,
  SeasonWatchedEpisodesResponse,
  TvShowWatchProgressResponse,
} from '../types';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { calculateSeasonProgressPercentage } from '../utils/season-progress';

export function invalidateHomeQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['home'] });
  invalidateRecommendationQueries(queryClient);
}

export function invalidateRecentWatchHistory(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['watch-history', 'recent'] });
}

export function invalidateMovieWatchHistoryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  movieId: string,
) {
  void queryClient.invalidateQueries({ queryKey: movieWatchStatusQueryKey(movieId) });
  void queryClient.invalidateQueries({ queryKey: ['watch-history', 'movies'] });
  invalidateRecentWatchHistory(queryClient);
  invalidateHomeQueries(queryClient);
}

export function invalidateEpisodeWatchHistoryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  episodeId: string,
  tvShowId: string,
  seasonNumber: number,
) {
  void queryClient.invalidateQueries({ queryKey: episodeWatchStatusQueryKey(episodeId) });
  void queryClient.invalidateQueries({ queryKey: ['watch-history', 'episodes'] });
  void queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
  void queryClient.invalidateQueries({
    queryKey: seasonProgressQueryKey(tvShowId, seasonNumber),
  });
  void queryClient.invalidateQueries({
    queryKey: seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
  });
  invalidateRecentWatchHistory(queryClient);
  invalidateHomeQueries(queryClient);
}

export function applySeasonWatchedEpisodeIds(
  queryClient: ReturnType<typeof useQueryClient>,
  tvShowId: string,
  seasonNumber: number,
  watchedEpisodeIds: string[],
) {
  queryClient.setQueryData<SeasonWatchedEpisodesResponse>(
    seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
    {
      tvShowId,
      seasonNumber,
      watchedEpisodeIds,
    },
  );
}

export function toggleSeasonWatchedEpisodeId(
  watchedEpisodeIds: string[],
  episodeId: string,
  watched: boolean,
): string[] {
  if (watched) {
    return watchedEpisodeIds.includes(episodeId)
      ? watchedEpisodeIds
      : [...watchedEpisodeIds, episodeId];
  }

  return watchedEpisodeIds.filter((id) => id !== episodeId);
}

export function applyOptimisticSeasonProgressCount(
  queryClient: ReturnType<typeof useQueryClient>,
  tvShowId: string,
  seasonNumber: number,
  watchedEpisodes: number,
) {
  const key = seasonProgressQueryKey(tvShowId, seasonNumber);
  const current = queryClient.getQueryData<SeasonWatchProgressResponse>(key);
  const totalEpisodes = current?.totalEpisodes ?? watchedEpisodes;

  queryClient.setQueryData<SeasonWatchProgressResponse>(key, {
    tvShowId,
    seasonNumber,
    totalEpisodes,
    watchedEpisodes,
    progressPercentage: calculateSeasonProgressPercentage(watchedEpisodes, totalEpisodes),
    nextEpisode: current?.nextEpisode ?? null,
  });
}

export function adjustOptimisticTvShowProgressCount(
  queryClient: ReturnType<typeof useQueryClient>,
  tvShowId: string,
  delta: number,
) {
  const key = tvShowProgressQueryKey(tvShowId);
  const current = queryClient.getQueryData<TvShowWatchProgressResponse>(key);

  if (!current) {
    return;
  }

  const watchedEpisodes = Math.max(
    0,
    Math.min(current.totalEpisodes, current.watchedEpisodes + delta),
  );

  queryClient.setQueryData<TvShowWatchProgressResponse>(key, {
    ...current,
    watchedEpisodes,
    progressPercentage: calculateSeasonProgressPercentage(
      watchedEpisodes,
      current.totalEpisodes,
    ),
  });
}

export function useToggleMovieWatched(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isWatched: boolean) => {
      if (isWatched) {
        await unmarkMovieWatched(movieId);
        return {
          movieId,
          isWatched: false,
          watchedAt: null,
        } satisfies MovieWatchStatusResponse;
      }

      const result = await markMovieWatched(movieId);
      return {
        movieId: result.movieId,
        isWatched: true,
        watchedAt: result.watchedAt,
      } satisfies MovieWatchStatusResponse;
    },
    onMutate: async (isWatched) => {
      const queryKey = movieWatchStatusQueryKey(movieId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MovieWatchStatusResponse>(queryKey);
      queryClient.setQueryData<MovieWatchStatusResponse>(queryKey, {
        movieId,
        isWatched: !isWatched,
        watchedAt: !isWatched ? new Date().toISOString() : null,
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(movieWatchStatusQueryKey(movieId), context.previous);
      }
    },
    onSuccess: (nextValue) => {
      queryClient.setQueryData(movieWatchStatusQueryKey(movieId), nextValue);
      invalidateMovieWatchHistoryQueries(queryClient, movieId);
    },
  });
}

export function useToggleEpisodeWatched(
  episodeId: string,
  tvShowId: string,
  seasonNumber: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isWatched: boolean) => {
      if (isWatched) {
        await unmarkEpisodeWatched(episodeId);
        return {
          episodeId,
          isWatched: false,
          watchedAt: null,
        } satisfies EpisodeWatchStatusResponse;
      }

      const result = await markEpisodeWatched(episodeId);
      return {
        episodeId: result.episodeId,
        isWatched: true,
        watchedAt: result.watchedAt,
      } satisfies EpisodeWatchStatusResponse;
    },
    onMutate: async (isWatched) => {
      const queryKey = episodeWatchStatusQueryKey(episodeId);
      const seasonKey = seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber);
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: seasonKey });

      const previous = queryClient.getQueryData<EpisodeWatchStatusResponse>(queryKey);
      const previousSeason = queryClient.getQueryData<SeasonWatchedEpisodesResponse>(seasonKey);
      const previousSeasonProgress = queryClient.getQueryData<SeasonWatchProgressResponse>(
        seasonProgressQueryKey(tvShowId, seasonNumber),
      );
      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(
        tvShowProgressQueryKey(tvShowId),
      );
      const nextWatched = !isWatched;

      queryClient.setQueryData<EpisodeWatchStatusResponse>(queryKey, {
        episodeId,
        isWatched: nextWatched,
        watchedAt: nextWatched ? new Date().toISOString() : null,
      });

      const nextWatchedIds = toggleSeasonWatchedEpisodeId(
        previousSeason?.watchedEpisodeIds ?? [],
        episodeId,
        nextWatched,
      );

      applySeasonWatchedEpisodeIds(queryClient, tvShowId, seasonNumber, nextWatchedIds);
      applyOptimisticSeasonProgressCount(
        queryClient,
        tvShowId,
        seasonNumber,
        nextWatchedIds.length,
      );
      adjustOptimisticTvShowProgressCount(queryClient, tvShowId, nextWatched ? 1 : -1);

      return {
        previous,
        previousSeason,
        previousSeasonProgress,
        previousTvProgress,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(episodeWatchStatusQueryKey(episodeId), context.previous);
      }
      if (context?.previousSeason) {
        queryClient.setQueryData(
          seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
          context.previousSeason,
        );
      }
      if (context?.previousSeasonProgress) {
        queryClient.setQueryData(
          seasonProgressQueryKey(tvShowId, seasonNumber),
          context.previousSeasonProgress,
        );
      }
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
    },
    onSuccess: (nextValue) => {
      queryClient.setQueryData(episodeWatchStatusQueryKey(episodeId), nextValue);
      invalidateEpisodeWatchHistoryQueries(
        queryClient,
        episodeId,
        tvShowId,
        seasonNumber,
      );
    },
  });
}

interface BulkEpisodeWatchVariables {
  episodeIds: string[];
  watched: boolean;
}

export function useBulkUpdateEpisodeWatchState(tvShowId: string, seasonNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ episodeIds, watched }: BulkEpisodeWatchVariables) =>
      bulkUpdateEpisodeWatchState(tvShowId, {
        episodeIds: [...new Set(episodeIds)],
        watched,
      }),
    onMutate: async ({ episodeIds, watched }) => {
      const seasonKey = seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber);
      await queryClient.cancelQueries({ queryKey: seasonKey });
      const previousSeason = queryClient.getQueryData<SeasonWatchedEpisodesResponse>(seasonKey);
      const previousSeasonProgress = queryClient.getQueryData<SeasonWatchProgressResponse>(
        seasonProgressQueryKey(tvShowId, seasonNumber),
      );
      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(
        tvShowProgressQueryKey(tvShowId),
      );
      const currentIds = previousSeason?.watchedEpisodeIds ?? [];
      const uniqueIds = [...new Set(episodeIds)];
      const nextIds = watched
        ? [...new Set([...currentIds, ...uniqueIds])]
        : currentIds.filter((id) => !uniqueIds.includes(id));

      applySeasonWatchedEpisodeIds(queryClient, tvShowId, seasonNumber, nextIds);
      applyOptimisticSeasonProgressCount(
        queryClient,
        tvShowId,
        seasonNumber,
        nextIds.length,
      );
      adjustOptimisticTvShowProgressCount(
        queryClient,
        tvShowId,
        nextIds.length - currentIds.length,
      );

      return { previousSeason, previousSeasonProgress, previousTvProgress };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSeason) {
        queryClient.setQueryData(
          seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
          context.previousSeason,
        );
      }
      if (context?.previousSeasonProgress) {
        queryClient.setQueryData(
          seasonProgressQueryKey(tvShowId, seasonNumber),
          context.previousSeasonProgress,
        );
      }
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
      void queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', tvShowId, 'season'],
      });
      void queryClient.invalidateQueries({
        queryKey: seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
      });
      invalidateRecentWatchHistory(queryClient);
      invalidateHomeQueries(queryClient);
    },
  });
}

export interface ToggleSeasonWatchedVariables {
  isFullyWatched: boolean;
  totalEpisodes: number;
  episodeIds: string[];
}

export function useToggleSeasonWatched(tvShowId: string, seasonNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isFullyWatched, episodeIds }: ToggleSeasonWatchedVariables) => {
      let resolvedEpisodeIds = episodeIds;

      if (resolvedEpisodeIds.length === 0) {
        const season = await getSeason(tvShowId, seasonNumber);
        resolvedEpisodeIds = season.episodes.map((episode) => episode.id);
      }

      if (resolvedEpisodeIds.length === 0) {
        throw new Error('No episodes found for this season.');
      }

      return bulkUpdateEpisodeWatchState(tvShowId, {
        episodeIds: resolvedEpisodeIds,
        watched: !isFullyWatched,
      });
    },
    onMutate: async ({ isFullyWatched, totalEpisodes, episodeIds }) => {
      const seasonKey = seasonProgressQueryKey(tvShowId, seasonNumber);
      const watchedEpisodesKey = seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber);
      await queryClient.cancelQueries({ queryKey: seasonKey });
      await queryClient.cancelQueries({ queryKey: watchedEpisodesKey });

      const previousSeasonProgress = queryClient.getQueryData<SeasonWatchProgressResponse>(seasonKey);
      const previousSeasonWatched = queryClient.getQueryData<SeasonWatchedEpisodesResponse>(
        watchedEpisodesKey,
      );
      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(
        tvShowProgressQueryKey(tvShowId),
      );
      const effectiveTotal = Math.max(
        totalEpisodes,
        episodeIds.length,
        previousSeasonProgress?.totalEpisodes ?? 0,
      );
      const watchedEpisodes = isFullyWatched ? 0 : effectiveTotal;
      const nextEpisodeIds = isFullyWatched ? [] : episodeIds;

      if (effectiveTotal > 0) {
        queryClient.setQueryData<SeasonWatchProgressResponse>(seasonKey, {
          tvShowId,
          seasonNumber,
          totalEpisodes: effectiveTotal,
          watchedEpisodes,
          progressPercentage: calculateSeasonProgressPercentage(watchedEpisodes, effectiveTotal),
          nextEpisode: previousSeasonProgress?.nextEpisode ?? null,
        });
        adjustOptimisticTvShowProgressCount(
          queryClient,
          tvShowId,
          watchedEpisodes - (previousSeasonProgress?.watchedEpisodes ?? 0),
        );
      }

      if (nextEpisodeIds.length > 0) {
        applySeasonWatchedEpisodeIds(queryClient, tvShowId, seasonNumber, nextEpisodeIds);
      } else if (isFullyWatched) {
        applySeasonWatchedEpisodeIds(queryClient, tvShowId, seasonNumber, []);
      }

      return { previousSeasonProgress, previousSeasonWatched, previousTvProgress };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSeasonProgress) {
        queryClient.setQueryData(
          seasonProgressQueryKey(tvShowId, seasonNumber),
          context.previousSeasonProgress,
        );
      }
      if (context?.previousSeasonWatched) {
        queryClient.setQueryData(
          seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
          context.previousSeasonWatched,
        );
      }
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
      void queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', tvShowId, 'season'],
      });
      void queryClient.invalidateQueries({
        queryKey: seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
      });
      void queryClient.invalidateQueries({ queryKey: ['watch-history', 'episode'] });
      invalidateRecentWatchHistory(queryClient);
      invalidateHomeQueries(queryClient);
    },
  });
}

export function useToggleTvShowWatched(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFullyWatched: boolean) => bulkUpdateTvShowWatchState(tvShowId, !isFullyWatched),
    onMutate: async (isFullyWatched) => {
      const tvKey = tvShowProgressQueryKey(tvShowId);
      await queryClient.cancelQueries({ queryKey: tvKey });

      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(tvKey);
      const totalEpisodes = previousTvProgress?.totalEpisodes ?? 0;
      const watchedEpisodes = isFullyWatched ? 0 : totalEpisodes;

      if (totalEpisodes > 0 && previousTvProgress) {
        queryClient.setQueryData<TvShowWatchProgressResponse>(tvKey, {
          ...previousTvProgress,
          watchedEpisodes,
          progressPercentage: calculateSeasonProgressPercentage(watchedEpisodes, totalEpisodes),
        });
      }

      return { previousTvProgress };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
      void queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', tvShowId, 'season'],
      });
      invalidateRecentWatchHistory(queryClient);
      invalidateHomeQueries(queryClient);
    },
  });
}

export function useMarkThroughEpisode(tvShowId: string, seasonNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episodeId: string) => markThroughEpisode(tvShowId, episodeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
      void queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', tvShowId, 'season'],
      });
      invalidateRecentWatchHistory(queryClient);
      invalidateHomeQueries(queryClient);
    },
  });
}
