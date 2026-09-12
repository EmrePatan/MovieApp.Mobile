import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  favoriteStatusQueryKey,
  resolveFavoriteStatus,
} from './favorite-query-keys';
import type { FavoriteContentType } from '../types';

export function useFavoriteStatus(contentType: FavoriteContentType, contentId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: favoriteStatusQueryKey(contentType, contentId),
    queryFn: ({ signal }) => resolveFavoriteStatus(contentType, contentId, signal),
    enabled: isAuthenticated && contentId.length > 0,
    staleTime: 30_000,
  });
}
