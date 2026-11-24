import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  bulkUpdateEpisodeWatchState,
  bulkUpdateSeasonWatchState,
  bulkUpdateTvShowWatchState,
  getTvShowProgress,
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
import { removeWatchedMovieFromHomeRecommendations } from '@/features/home/utils/remove-watched-from-home-recommendations';
import { invalidateLibraryQueries } from '@/features/library/utils/invalidate-library-queries';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { invalidateSocialActivityQueries } from '@/features/social/utils/invalidate-social-activity-queries';
import { calculateSeasonProgressPercentage } from '../utils/season-progress';
import {
  updateTvShowAggregateAllSeasonsWatched,
  updateTvShowAggregateSeasonProgress,
} from '../utils/tv-show-progress-cache';
import { requestTvShowCompletionCelebration } from '../utils/tv-show-completion-celebration-requests';

function restoreQuerySnapshot<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  previous: T | undefined,
): void {
  if (previous === undefined) {
    queryClient.removeQueries({ queryKey, exact: true });
    return;
  }

  queryClient.setQueryData(queryKey, previous);
}

export function invalidateHomeQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['home'] });
  invalidateRecommendationQueries(queryClient);
  invalidateProfileStatistics(queryClient);
}

export function invalidateRecentWatchHistory(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['watch-history', 'recent'] });
}

/** Surfaces whose content depends on watch state: recent history, home, and library shelves. */
export function invalidateWatchStateDependents(queryClient: ReturnType<typeof useQueryClient>) {
  invalidateRecentWatchHistory(queryClient);
  invalidateHomeQueries(queryClient);
  invalidateLibraryQueries(queryClient);
  invalidateSocialActivityQueries(queryClient);
}

export function invalidateMovieWatchHistoryQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  movieId: string,
) {
  void queryClient.invalidateQueries({ queryKey: movieWatchStatusQueryKey(movieId) });
  void queryClient.invalidateQueries({ queryKey: ['watch-history', 'movies'] });
  invalidateWatchStateDependents(queryClient);
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
  invalidateLibraryQueries(queryClient);
  void queryClient.invalidateQueries({ queryKey: ['home', 'personalized'] });
  void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
  invalidateProfileStatistics(queryClient);
  invalidateSocialActivityQueries(queryClient);
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
  totalEpisodes?: number,
) {
  const key = seasonProgressQueryKey(tvShowId, seasonNumber);
  const current = queryClient.getQueryData<SeasonWatchProgressResponse>(key);
  const resolvedTotalEpisodes = totalEpisodes ?? current?.totalEpisodes ?? watchedEpisodes;

  queryClient.setQueryData<SeasonWatchProgressResponse>(key, {
    tvShowId,
    seasonNumber,
    totalEpisodes: resolvedTotalEpisodes,
    watchedEpisodes,
    progressPercentage: calculateSeasonProgressPercentage(
      watchedEpisodes,
      resolvedTotalEpisodes,
    ),
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
      restoreQuerySnapshot(
        queryClient,
        movieWatchStatusQueryKey(movieId),
        context?.previous,
      );
    },
    onSuccess: (nextValue) => {
      queryClient.setQueryData(movieWatchStatusQueryKey(movieId), nextValue);
      if (nextValue.isWatched) {
        removeWatchedMovieFromHomeRecommendations(queryClient, movieId);
      }
      invalidateMovieWatchHistoryQueries(queryClient, movieId);
    },
  });
}

export interface ToggleEpisodeWatchedInput {
  episodeId: string;
  isWatched: boolean;
}

export function useToggleEpisodeWatched(tvShowId: string, seasonNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ episodeId, isWatched }: ToggleEpisodeWatchedInput) => {
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
    onMutate: async ({ episodeId, isWatched }) => {
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
      updateTvShowAggregateSeasonProgress(
        queryClient,
        tvShowId,
        seasonNumber,
        nextWatchedIds.length,
        previousSeasonProgress?.totalEpisodes,
      );

      return {
        previous,
        previousSeason,
        previousSeasonProgress,
        previousTvProgress,
      };
    },
    onError: (_error, { episodeId }, context) => {
      restoreQuerySnapshot(
        queryClient,
        episodeWatchStatusQueryKey(episodeId),
        context?.previous,
      );
      restoreQuerySnapshot(
        queryClient,
        seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
        context?.previousSeason,
      );
      restoreQuerySnapshot(
        queryClient,
        seasonProgressQueryKey(tvShowId, seasonNumber),
        context?.previousSeasonProgress,
      );
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
    },
    onSuccess: (nextValue, { episodeId }) => {
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
        previousSeasonProgress?.totalEpisodes,
      );
      updateTvShowAggregateSeasonProgress(
        queryClient,
        tvShowId,
        seasonNumber,
        nextIds.length,
        previousSeasonProgress?.totalEpisodes,
      );

      return { previousSeason, previousSeasonProgress, previousTvProgress };
    },
    onError: (_error, _variables, context) => {
      restoreQuerySnapshot(
        queryClient,
        seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
        context?.previousSeason,
      );
      restoreQuerySnapshot(
        queryClient,
        seasonProgressQueryKey(tvShowId, seasonNumber),
        context?.previousSeasonProgress,
      );
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
      invalidateWatchStateDependents(queryClient);
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
      if (episodeIds.length === 0) {
        // The server resolves the season's aired episodes itself. Sending catalog episode IDs from
        // the client broke on seasons whose episodes were not ingested yet or were still unaired.
        return bulkUpdateSeasonWatchState(tvShowId, seasonNumber, !isFullyWatched);
      }

      return bulkUpdateEpisodeWatchState(tvShowId, {
        episodeIds,
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
        updateTvShowAggregateSeasonProgress(
          queryClient,
          tvShowId,
          seasonNumber,
          watchedEpisodes,
          effectiveTotal,
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
      restoreQuerySnapshot(
        queryClient,
        seasonProgressQueryKey(tvShowId, seasonNumber),
        context?.previousSeasonProgress,
      );
      restoreQuerySnapshot(
        queryClient,
        seasonWatchedEpisodesQueryKey(tvShowId, seasonNumber),
        context?.previousSeasonWatched,
      );
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
      invalidateWatchStateDependents(queryClient);
    },
  });
}

export type ToggleTvShowWatchedResult = {
  markingWatched: boolean;
  celebrated: boolean;
};

export function useToggleTvShowWatched(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFullyWatched: boolean): Promise<ToggleTvShowWatchedResult> => {
      const markingWatched = !isFullyWatched;
      await bulkUpdateTvShowWatchState(tvShowId, markingWatched);

      await queryClient.invalidateQueries({ queryKey: tvShowProgressQueryKey(tvShowId) });
      await queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', tvShowId, 'season'],
      });
      invalidateWatchStateDependents(queryClient);

      const progress = await queryClient.fetchQuery({
        queryKey: tvShowProgressQueryKey(tvShowId),
        queryFn: ({ signal }) => getTvShowProgress(tvShowId, signal),
      });

      const celebrated = markingWatched && progress.isCompleted === true;
      if (celebrated) {
        requestTvShowCompletionCelebration(tvShowId);
      }

      return { markingWatched, celebrated };
    },
    onMutate: async (isFullyWatched) => {
      const tvKey = tvShowProgressQueryKey(tvShowId);
      await queryClient.cancelQueries({ queryKey: tvKey });

      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(tvKey);

      if (previousTvProgress) {
        updateTvShowAggregateAllSeasonsWatched(queryClient, tvShowId, !isFullyWatched);
      }

      return { previousTvProgress };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTvProgress) {
        queryClient.setQueryData(tvShowProgressQueryKey(tvShowId), context.previousTvProgress);
      }
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
      invalidateWatchStateDependents(queryClient);
    },
  });
}
