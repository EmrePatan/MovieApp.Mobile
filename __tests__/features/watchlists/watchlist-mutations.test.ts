import {
  invalidateAllWatchlistItemQueries,
  invalidateWatchlistMembership,
} from '@/features/watchlists/hooks/useWatchlistMutations';
import {
  watchlistMembershipQueryKey,
  watchlistQueryKey,
  watchlistsQueryKey,
} from '@/features/watchlists/hooks/watchlist-query-keys';

describe('watchlist cache invalidation', () => {
  const watchlistId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const contentId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('invalidates watchlists and selected watchlist item queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateAllWatchlistItemQueries(queryClient, watchlistId);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: watchlistsQueryKey() });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: watchlistQueryKey(watchlistId) });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['watchlist', watchlistId, 'items'],
    });
  });

  it('invalidates only watchlists when no watchlist id is provided', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateAllWatchlistItemQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: watchlistsQueryKey() });
  });

  it('invalidates watchlist membership query', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateWatchlistMembership(queryClient, 'movie', contentId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: watchlistMembershipQueryKey('movie', contentId),
    });
  });
});
