import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import type { CatalogMediaFilter } from '@/features/library/types';
import { getCurrentUserReviews } from '../api/reviews-api';
import { myCommentsInfiniteQueryKey } from './review-query-keys';
import { DEFAULT_MY_COMMENTS_PAGE_SIZE } from '../types/my-comments';

export function useMyComments(
  mediaType: CatalogMediaFilter,
  options?: { enabled?: boolean },
) {
  const { isAuthenticated } = useAuth();
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: myCommentsInfiniteQueryKey(mediaType),
    queryFn: ({ pageParam, signal }) =>
      getCurrentUserReviews(pageParam, DEFAULT_MY_COMMENTS_PAGE_SIZE, mediaType, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}
