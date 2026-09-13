import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMovieFavorite,
  addTvFavorite,
  removeMovieFavorite,
  removeTvFavorite,
} from '../api/favorites-api';
import {
  favoriteStatusQueryKey,
  favoritesInfiniteQueryKey,
  favoritesListQueryKey,
} from './favorite-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { removeFavoriteFromCache } from '@/features/library/utils/optimistic-favorites-cache';
import type { FavoriteContentType } from '../types';
import { DEFAULT_FAVORITES_PAGE_SIZE } from '../types';

function invalidateFavoriteQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: FavoriteContentType,
  contentId: string,
) {
  void queryClient.invalidateQueries({ queryKey: favoriteStatusQueryKey(contentType, contentId) });
  void queryClient.invalidateQueries({ queryKey: ['favorites'] });
  invalidateRecommendationQueries(queryClient);
}

export function invalidateAllFavoriteListQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ['favorites'] });
}

export function invalidateFavoriteStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: FavoriteContentType,
  contentId: string,
) {
  void queryClient.invalidateQueries({ queryKey: favoriteStatusQueryKey(contentType, contentId) });
}

export function useToggleFavorite(contentType: FavoriteContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFavorited: boolean) => {
      if (contentType === 'movie') {
        if (isFavorited) {
          await removeMovieFavorite(contentId);
          return false;
        }

        await addMovieFavorite(contentId);
        return true;
      }

      if (isFavorited) {
        await removeTvFavorite(contentId);
        return false;
      }

      await addTvFavorite(contentId);
      return true;
    },
    onMutate: async (isFavorited) => {
      const queryKey = favoriteStatusQueryKey(contentType, contentId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, !isFavorited);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          favoriteStatusQueryKey(contentType, contentId),
          context.previous,
        );
      }
    },
    onSuccess: (nextValue) => {
      queryClient.setQueryData(favoriteStatusQueryKey(contentType, contentId), nextValue);
      invalidateFavoriteQueries(queryClient, contentType, contentId);
    },
  });
}

export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentType,
      contentId,
    }: {
      contentType: FavoriteContentType;
      contentId: string;
    }) => {
      if (contentType === 'movie') {
        await removeMovieFavorite(contentId);
        return;
      }

      await removeTvFavorite(contentId);
    },
    onMutate: async (variables) => {
      const listQueryKey = favoritesInfiniteQueryKey(DEFAULT_FAVORITES_PAGE_SIZE);
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      const previousList = removeFavoriteFromCache(
        queryClient,
        variables.contentType,
        variables.contentId,
      );

      const statusQueryKey = favoriteStatusQueryKey(variables.contentType, variables.contentId);
      await queryClient.cancelQueries({ queryKey: statusQueryKey });
      const previousStatus = queryClient.getQueryData<boolean>(statusQueryKey);
      queryClient.setQueryData(statusQueryKey, false);

      return { previousList, previousStatus, statusQueryKey, listQueryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(context.listQueryKey, context.previousList);
      }

      if (context?.previousStatus !== undefined && context?.statusQueryKey) {
        queryClient.setQueryData(context.statusQueryKey, context.previousStatus);
      }
    },
    onSuccess: (_result, variables) => {
      queryClient.setQueryData(
        favoriteStatusQueryKey(variables.contentType, variables.contentId),
        false,
      );
      invalidateAllFavoriteListQueries(queryClient);
      invalidateFavoriteStatus(queryClient, variables.contentType, variables.contentId);
      invalidateRecommendationQueries(queryClient);
    },
  });
}

export { favoritesListQueryKey, favoriteStatusQueryKey };
