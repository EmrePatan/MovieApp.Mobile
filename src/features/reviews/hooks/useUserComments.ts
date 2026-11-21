import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import type { CatalogMediaFilter } from '@/features/library/types';
import { getUserReviews } from '../api/reviews-api';
import { userCommentsInfiniteQueryKey } from './review-query-keys';
import { DEFAULT_MY_COMMENTS_PAGE_SIZE } from '../types/my-comments';

export function useUserComments(userId: string, mediaType: CatalogMediaFilter) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: userCommentsInfiniteQueryKey(userId, mediaType),
    queryFn: ({ pageParam, signal }) =>
      getUserReviews(userId, pageParam, DEFAULT_MY_COMMENTS_PAGE_SIZE, mediaType, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated && Boolean(userId),
    staleTime: 30_000,
  });
}
