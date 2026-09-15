import type { QueryClient } from '@tanstack/react-query';
import { followingCatalogInfiniteQueryKey } from '@/features/following/hooks/following-query-keys';
import { upcomingCatalogInfiniteQueryKey } from '@/features/upcoming/hooks/upcoming-query-keys';

export function invalidateFollowCatalogQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: followingCatalogInfiniteQueryKey() });
  void queryClient.invalidateQueries({ queryKey: upcomingCatalogInfiniteQueryKey() });
}
