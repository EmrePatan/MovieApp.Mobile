import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';
import { getFollowingCatalog } from '../api/following-api';
import { followingCatalogInfiniteQueryKey } from './following-query-keys';
import { DEFAULT_FOLLOWING_PAGE_SIZE } from '../types';

export function useFollowingCatalog(pageSize = DEFAULT_FOLLOWING_PAGE_SIZE) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: followingCatalogInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) =>
      getFollowingCatalog({ page: pageParam, pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: getCatalogNextPageParam,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
