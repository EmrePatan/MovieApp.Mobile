import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markEpisodeWatched,
  markMovieWatched,
  unmarkEpisodeWatched,
  unmarkMovieWatched,
} from '../api/watch-history-api';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  seasonProgressQueryKey,
  tvShowProgressQueryKey,
} from './watch-history-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import type { EpisodeWatchStatusResponse, MovieWatchStatusResponse } from '../types';

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
  invalidateRecentWatchHistory(queryClient);
  invalidateHomeQueries(queryClient);
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
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<EpisodeWatchStatusResponse>(queryKey);
      queryClient.setQueryData<EpisodeWatchStatusResponse>(queryKey, {
        episodeId,
        isWatched: !isWatched,
        watchedAt: !isWatched ? new Date().toISOString() : null,
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(episodeWatchStatusQueryKey(episodeId), context.previous);
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
