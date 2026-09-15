import type { QueryClient } from '@tanstack/react-query';
import { FOLLOWING_CATALOG_QUERY_KEY_ROOT } from '@/features/following/hooks/following-query-keys';
import { UPCOMING_CATALOG_QUERY_KEY_ROOT } from '@/features/upcoming/hooks/upcoming-query-keys';

export function invalidateFollowCatalogQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: FOLLOWING_CATALOG_QUERY_KEY_ROOT });
  void queryClient.invalidateQueries({ queryKey: UPCOMING_CATALOG_QUERY_KEY_ROOT });
}
