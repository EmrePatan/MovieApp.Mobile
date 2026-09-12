import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getFavorites } from '../api/favorites-api';
import { favoritesInfiniteQueryKey } from './favorite-query-keys';
import { DEFAULT_FAVORITES_PAGE_SIZE } from '../types';

export function useFavoritesItems() {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: favoritesInfiniteQueryKey(DEFAULT_FAVORITES_PAGE_SIZE),
    queryFn: ({ pageParam, signal }) =>
      getFavorites(pageParam, DEFAULT_FAVORITES_PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
