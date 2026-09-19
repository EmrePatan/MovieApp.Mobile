import { QueryClient } from '@tanstack/react-query';
import {
  COLLECTION_DETAIL_QUERY_KEY_ROOT,
  invalidateLocalizedDetailQueries,
  MOVIE_DETAIL_QUERY_KEY_ROOT,
  PERSON_DETAIL_QUERY_KEY_ROOT,
  TV_SHOW_DETAIL_QUERY_KEY_ROOT,
} from '@/features/locale/utils/invalidate-localized-detail-queries';

describe('invalidateLocalizedDetailQueries', () => {
  it('invalidates locale-sensitive detail query roots', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    invalidateLocalizedDetailQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: MOVIE_DETAIL_QUERY_KEY_ROOT });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: TV_SHOW_DETAIL_QUERY_KEY_ROOT });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: PERSON_DETAIL_QUERY_KEY_ROOT });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: COLLECTION_DETAIL_QUERY_KEY_ROOT,
    });
  });
});
