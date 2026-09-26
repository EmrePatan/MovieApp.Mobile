import { QueryClient } from '@tanstack/react-query';
import {
  EPISODE_DETAIL_QUERY_KEY_ROOT,
  invalidateLocalizedDetailQueries,
  SEASON_DETAIL_QUERY_KEY_ROOT,
} from '@/features/locale/utils/invalidate-localized-detail-queries';

describe('invalidateLocalizedDetailQueries', () => {
  it('invalidates season and episode detail queries on language change', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    invalidateLocalizedDetailQueries(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SEASON_DETAIL_QUERY_KEY_ROOT });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: EPISODE_DETAIL_QUERY_KEY_ROOT });
  });
});
