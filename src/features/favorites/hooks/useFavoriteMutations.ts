import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMovieFavorite,
  addTvFavorite,
  removeMovieFavorite,
  removeTvFavorite,
} from '../api/favorites-api';
import {
  favoriteStatusQueryKey,
  favoritesListQueryKey,
} from './favorite-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import type { FavoriteContentType } from '../types';

function invalidateFavoriteQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: FavoriteContentType,
  contentId: string,
) {
  void queryClient.invalidateQueries({ queryKey: favoriteStatusQueryKey(contentType, contentId) });
  void queryClient.invalidateQueries({ queryKey: ['favorites'] });
  invalidateRecommendationQueries(queryClient);
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

export { favoritesListQueryKey, favoriteStatusQueryKey };
