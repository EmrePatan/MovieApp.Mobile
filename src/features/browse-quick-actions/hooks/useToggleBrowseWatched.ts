import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  deleteMovieRating,
  deleteTvRating,
} from '@/features/ratings/api/ratings-api';
import {
  movieMyRatingQueryKey,
  movieRatingAggregateQueryKey,
  tvMyRatingQueryKey,
  tvRatingAggregateQueryKey,
} from '@/features/ratings/hooks/rating-query-keys';
import {
  bulkUpdateTvShowWatchState,
  getTvShowProgress,
  markMovieWatched,
  unmarkMovieWatched,
} from '@/features/watch-history/api/watch-history-api';
import {
  invalidateMovieWatchHistoryQueries,
  invalidateWatchStateDependents,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';
import {
  movieWatchStatusQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import type {
  MovieWatchStatusResponse,
  TvShowWatchProgressResponse,
} from '@/features/watch-history/types';
import { updateTvShowAggregateAllSeasonsWatched } from '@/features/watch-history/utils/tv-show-progress-cache';
import { requestTvShowCompletionCelebration } from '@/features/watch-history/utils/tv-show-completion-celebration-requests';
import type { BrowseQuickActionsTarget } from '../types';

async function clearPersonalRatingOnUnwatch(
  queryClient: QueryClient,
  contentType: BrowseQuickActionsTarget['contentType'],
  contentId: string,
): Promise<void> {
  const myRatingKey =
    contentType === 'movie' ? movieMyRatingQueryKey(contentId) : tvMyRatingQueryKey(contentId);

  try {
    if (contentType === 'movie') {
      await deleteMovieRating(contentId);
    } else {
      await deleteTvRating(contentId);
    }
  } catch {
    // Absent rating or delete race — unwatch still proceeds.
  }

  queryClient.setQueryData(myRatingKey, null);
  void queryClient.invalidateQueries({
    queryKey:
      contentType === 'movie'
        ? movieRatingAggregateQueryKey(contentId)
        : tvRatingAggregateQueryKey(contentId),
  });
}

export type ToggleBrowseWatchedInput = {
  target: BrowseQuickActionsTarget;
  /** Current watched state before the toggle. */
  isWatched: boolean;
};

export type ToggleBrowseWatchedResult = {
  target: BrowseQuickActionsTarget;
  /** Watched state after a successful toggle. */
  nextWatched: boolean;
  celebrated: boolean;
};

/**
 * Target-scoped watched toggle for browse posters / quick actions.
 * Unlike detail hooks, movie/tv id comes from mutation variables.
 */
export function useToggleBrowseWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target,
      isWatched,
    }: ToggleBrowseWatchedInput): Promise<ToggleBrowseWatchedResult> => {
      if (target.contentType === 'movie') {
        if (isWatched) {
          await clearPersonalRatingOnUnwatch(queryClient, 'movie', target.contentId);
          await unmarkMovieWatched(target.contentId);
          invalidateMovieWatchHistoryQueries(queryClient, target.contentId);
          return { target, nextWatched: false, celebrated: false };
        }

        const result = await markMovieWatched(target.contentId);
        queryClient.setQueryData<MovieWatchStatusResponse>(
          movieWatchStatusQueryKey(target.contentId),
          {
            movieId: result.movieId,
            isWatched: true,
            watchedAt: result.watchedAt,
          },
        );
        invalidateMovieWatchHistoryQueries(queryClient, target.contentId);
        return { target, nextWatched: true, celebrated: false };
      }

      const markingWatched = !isWatched;
      if (!markingWatched) {
        await clearPersonalRatingOnUnwatch(queryClient, 'tv', target.contentId);
      }
      await bulkUpdateTvShowWatchState(target.contentId, markingWatched);

      await queryClient.invalidateQueries({
        queryKey: tvShowProgressQueryKey(target.contentId),
      });
      await queryClient.invalidateQueries({
        queryKey: ['watch-history', 'tv', target.contentId, 'season'],
      });
      invalidateWatchStateDependents(queryClient);

      const progress = await queryClient.fetchQuery({
        queryKey: tvShowProgressQueryKey(target.contentId),
        queryFn: ({ signal }) => getTvShowProgress(target.contentId, signal),
      });

      const celebrated = markingWatched && progress.isCompleted === true;
      if (celebrated) {
        requestTvShowCompletionCelebration(target.contentId);
      }

      return { target, nextWatched: markingWatched, celebrated };
    },
    onMutate: async ({ target, isWatched }) => {
      const myRatingKey =
        target.contentType === 'movie'
          ? movieMyRatingQueryKey(target.contentId)
          : tvMyRatingQueryKey(target.contentId);
      const previousRating = isWatched
        ? queryClient.getQueryData(myRatingKey)
        : undefined;

      if (isWatched) {
        await queryClient.cancelQueries({ queryKey: myRatingKey });
        queryClient.setQueryData(myRatingKey, null);
      }

      if (target.contentType === 'movie') {
        const queryKey = movieWatchStatusQueryKey(target.contentId);
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<MovieWatchStatusResponse>(queryKey);
        queryClient.setQueryData<MovieWatchStatusResponse>(queryKey, {
          movieId: target.contentId,
          isWatched: !isWatched,
          watchedAt: !isWatched ? new Date().toISOString() : null,
        });
        return {
          contentType: 'movie' as const,
          contentId: target.contentId,
          previous,
          previousRating,
          myRatingKey,
        };
      }

      const tvKey = tvShowProgressQueryKey(target.contentId);
      await queryClient.cancelQueries({ queryKey: tvKey });
      const previousTvProgress = queryClient.getQueryData<TvShowWatchProgressResponse>(tvKey);

      if (previousTvProgress) {
        updateTvShowAggregateAllSeasonsWatched(queryClient, target.contentId, !isWatched);
      }

      return {
        contentType: 'tv' as const,
        contentId: target.contentId,
        previousTvProgress,
        previousRating,
        myRatingKey,
      };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousRating !== undefined) {
        queryClient.setQueryData(context.myRatingKey, context.previousRating);
      }

      if (context.contentType === 'movie') {
        const key = movieWatchStatusQueryKey(context.contentId);
        if (context.previous === undefined) {
          queryClient.removeQueries({ queryKey: key, exact: true });
        } else {
          queryClient.setQueryData(key, context.previous);
        }
        return;
      }

      if (context.previousTvProgress) {
        queryClient.setQueryData(
          tvShowProgressQueryKey(context.contentId),
          context.previousTvProgress,
        );
      }
    },
  });
}
