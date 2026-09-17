import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMovieToWatchlist,
  addTvToWatchlist,
  createWatchlist,
  deleteWatchlist,
  updateWatchlist,
  removeMovieFromWatchlist,
  removeTvFromWatchlist,
} from '../api/watchlists-api';
import {
  watchlistItemsInfiniteQueryKey,
  watchlistMembershipQueryKey,
  watchlistQueryKey,
  watchlistsQueryKey,
} from './watchlist-query-keys';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { invalidateLibraryQueries } from '@/features/library/utils/invalidate-library-queries';
import { removeWatchlistItemFromCache } from '@/features/library/utils/optimistic-watchlist-cache';
import type { WatchlistContentType } from '../types';
import { DEFAULT_WATCHLIST_PAGE_SIZE } from '../types';

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
  invalidateLibraryQueries(queryClient);
  invalidateRecommendationQueries(queryClient);
  invalidateProfileStatistics(queryClient);
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
      invalidateLibraryQueries(queryClient);
      invalidateProfileStatistics(queryClient);
    },
  });
}

export function useDeleteWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (watchlistId: string) => deleteWatchlist(watchlistId),
    onSuccess: (_result, watchlistId) => {
      invalidateAllWatchlistItemQueries(queryClient, watchlistId);
      invalidateLibraryQueries(queryClient);
    },
  });
}

export function useRenameWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, name }: { watchlistId: string; name: string }) =>
      updateWatchlist(watchlistId, name),
    onSuccess: (_result, variables) => {
      invalidateAllWatchlistItemQueries(queryClient, variables.watchlistId);
      invalidateLibraryQueries(queryClient);
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
    onMutate: async ({ watchlistId, isInWatchlist }) => {
      const membershipKey = watchlistMembershipQueryKey(contentType, contentId);
      await queryClient.cancelQueries({ queryKey: membershipKey });
      const previousMembership = queryClient.getQueryData<Record<string, boolean>>(membershipKey);
      queryClient.setQueryData<Record<string, boolean>>(membershipKey, (current = {}) => ({
        ...current,
        [watchlistId]: !isInWatchlist,
      }));

      return { previousMembership, membershipKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.membershipKey) {
        queryClient.setQueryData(context.membershipKey, context.previousMembership);
      }
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
    onMutate: async (variables) => {
      if (!watchlistId) {
        return {};
      }

      const listQueryKey = watchlistItemsInfiniteQueryKey(
        watchlistId,
        DEFAULT_WATCHLIST_PAGE_SIZE,
      );
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      const previousList = removeWatchlistItemFromCache(
        queryClient,
        watchlistId,
        variables.contentType,
        variables.contentId,
      );

      return { previousList, listQueryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousList && context?.listQueryKey) {
        queryClient.setQueryData(context.listQueryKey, context.previousList);
      }
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
