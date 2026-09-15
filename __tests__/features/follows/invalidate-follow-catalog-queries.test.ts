import { QueryClient } from '@tanstack/react-query';
import { invalidateFollowCatalogQueries } from '@/features/follows/utils/invalidate-follow-catalog-queries';
import { FOLLOWING_CATALOG_QUERY_KEY_ROOT } from '@/features/following/hooks/following-query-keys';
import { HOME_QUERY_KEY_ROOT } from '@/features/home/hooks/home-query-keys';
import { UPCOMING_CATALOG_QUERY_KEY_ROOT } from '@/features/upcoming/hooks/upcoming-query-keys';

describe('invalidateFollowCatalogQueries', () => {
  it('invalidates all following and upcoming catalog page-size caches', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const refetchQueries = jest.spyOn(queryClient, 'refetchQueries');

    invalidateFollowCatalogQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: FOLLOWING_CATALOG_QUERY_KEY_ROOT,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: UPCOMING_CATALOG_QUERY_KEY_ROOT,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: HOME_QUERY_KEY_ROOT,
    });
    expect(refetchQueries).toHaveBeenCalledWith({
      queryKey: HOME_QUERY_KEY_ROOT,
      type: 'active',
    });
  });
});
