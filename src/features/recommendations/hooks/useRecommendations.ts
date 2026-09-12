import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getRecommendations } from '../api/recommendations-api';
import { recommendationsInfiniteQueryKey } from './recommendation-query-keys';
import type { SearchContentType } from '@/models/api/pagination';
import { DEFAULT_RECOMMENDATION_PAGE_SIZE } from '../types';

export function useRecommendations(
  type: SearchContentType = 'all',
  pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE,
) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: recommendationsInfiniteQueryKey(type, pageSize),
    queryFn: ({ pageParam, signal }) =>
      getRecommendations({ type, page: pageParam, pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
    staleTime: 120_000,
  });
}
