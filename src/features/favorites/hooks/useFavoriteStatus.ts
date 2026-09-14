import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getMovieFavoriteStatus, getTvFavoriteStatus } from '../api/favorites-api';
import { favoriteStatusQueryKey } from './favorite-query-keys';
import type { FavoriteContentType } from '../types';

interface UseFavoriteStatusOptions {
  enabled?: boolean;
}

export function useFavoriteStatus(
  contentType: FavoriteContentType,
  contentId: string,
  options: UseFavoriteStatusOptions = {},
) {
  const { isAuthenticated } = useAuth();
  const enabled = options.enabled ?? true;

  return useQuery({
    queryKey: favoriteStatusQueryKey(contentType, contentId),
    queryFn: async ({ signal }) => {
      const response =
        contentType === 'movie'
          ? await getMovieFavoriteStatus(contentId, signal)
          : await getTvFavoriteStatus(contentId, signal);

      return response.isFavorited;
    },
    enabled: enabled && isAuthenticated && contentId.length > 0,
    staleTime: 30_000,
  });
}
