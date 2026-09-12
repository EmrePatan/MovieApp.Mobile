import {
  invalidateAllFavoriteListQueries,
  invalidateFavoriteStatus,
} from '@/features/favorites/hooks/useFavoriteMutations';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';

describe('favorite cache invalidation', () => {
  const contentId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('invalidates all favorites list queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateAllFavoriteListQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favorites'] });
  });

  it('invalidates favorite status query', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateFavoriteStatus(queryClient, 'movie', contentId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: favoriteStatusQueryKey('movie', contentId),
    });
  });
});
