import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMovieToWatchlist,
  addTvToWatchlist,
  createWatchlist,
  deleteWatchlist,
  removeMovieFromWatchlist,
  removeTvFromWatchlist,
} from '../api/watchlists-api';
import {
  watchlistMembershipQueryKey,
  watchlistQueryKey,
  watchlistsQueryKey,
} from './watchlist-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import type { WatchlistContentType } from '../types';

export function invalidateAllWatchlistItemQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  watchlistId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: watchlistsQueryKey() });

  if (watchlistId) {
    void queryClient.invalidateQueries({ queryKey: watchlistQueryKey(watchlistId) });
    void queryClient.invalidateQueries({ queryKey: ['watchlist', watchlistId, 'items'] });
  }
}

export function invalidateWatchlistMembership(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: WatchlistContentType,
  contentId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: watchlistMembershipQueryKey(contentType, contentId),
  });
}

function invalidateWatchlistQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: WatchlistContentType,
  contentId: string,
  watchlistId?: string,
) {
  invalidateAllWatchlistItemQueries(queryClient, watchlistId);
  invalidateWatchlistMembership(queryClient, contentType, contentId);
  invalidateRecommendationQueries(queryClient);
}

export function useCreateWatchlist(
  contentType: WatchlistContentType,
  contentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createWatchlist(name),
    onSuccess: () => {
      invalidateWatchlistQueries(queryClient, contentType, contentId);
    },
  });
}

export function useCreateWatchlistForLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createWatchlist(name),
    onSuccess: () => {
      invalidateAllWatchlistItemQueries(queryClient);
    },
  });
}

export function useDeleteWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (watchlistId: string) => deleteWatchlist(watchlistId),
    onSuccess: (_result, watchlistId) => {
      invalidateAllWatchlistItemQueries(queryClient, watchlistId);
    },
  });
}

export function useWatchlistItemMutation(
  contentType: WatchlistContentType,
  contentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchlistId,
      isInWatchlist,
    }: {
      watchlistId: string;
      isInWatchlist: boolean;
    }) => {
      if (contentType === 'movie') {
        if (isInWatchlist) {
          await removeMovieFromWatchlist(watchlistId, contentId);
          return false;
        }

        await addMovieToWatchlist(watchlistId, contentId);
        return true;
      }

      if (isInWatchlist) {
        await removeTvFromWatchlist(watchlistId, contentId);
        return false;
      }

      await addTvToWatchlist(watchlistId, contentId);
      return true;
    },
    onSuccess: (_result, variables) => {
      invalidateWatchlistQueries(
        queryClient,
        contentType,
        contentId,
        variables.watchlistId,
      );
    },
  });
}

export function useRemoveWatchlistItemMutation(watchlistId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentType,
      contentId,
    }: {
      contentType: WatchlistContentType;
      contentId: string;
    }) => {
      if (!watchlistId) {
        throw new Error('No watchlist selected.');
      }

      if (contentType === 'movie') {
        await removeMovieFromWatchlist(watchlistId, contentId);
        return;
      }

      await removeTvFromWatchlist(watchlistId, contentId);
    },
    onSuccess: (_result, variables) => {
      if (!watchlistId) {
        return;
      }

      invalidateAllWatchlistItemQueries(queryClient, watchlistId);
      invalidateWatchlistMembership(
        queryClient,
        variables.contentType,
        variables.contentId,
      );
    },
  });
}
