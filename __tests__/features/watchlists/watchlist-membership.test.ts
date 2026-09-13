import { isContentInAnyWatchlist } from '@/features/watchlists/utils/watchlist-membership';

describe('watchlist-membership', () => {
  it('returns true when content is in at least one list', () => {
    expect(
      isContentInAnyWatchlist({
        'wl-1': false,
        'wl-2': true,
      }),
    ).toBe(true);
  });

  it('returns false when content is not in any list', () => {
    expect(
      isContentInAnyWatchlist({
        'wl-1': false,
        'wl-2': false,
      }),
    ).toBe(false);
  });
});
