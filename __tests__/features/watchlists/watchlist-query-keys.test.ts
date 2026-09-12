import { watchlistItemsInfiniteQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';

describe('watchlist infinite query keys', () => {
  it('uses watchlist items infinite query key', () => {
    expect(watchlistItemsInfiniteQueryKey('watchlist-id', 20)).toEqual([
      'watchlist',
      'watchlist-id',
      'items',
      20,
    ]);
  });
});
