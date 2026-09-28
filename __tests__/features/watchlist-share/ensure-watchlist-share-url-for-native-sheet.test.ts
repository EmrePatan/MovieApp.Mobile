import { ensureWatchlistShareUrlForNativeSheet } from '@/features/watchlist-share/ensure-watchlist-share-url-for-native-sheet';
import { pickWatchlistShareUrl } from '@/features/watchlist-share/pick-watchlist-share-url';

const WATCHLIST_ID = '4efb197d-75da-4ca9-8eea-a3d7a8e112d5';
const URL_A = 'https://moviecaveapp.com/watchlist/abcdefghijklmnopqrstuvwxyz123456';
const URL_B = 'https://moviecaveapp.com/watchlist/zyxwvutsrqponmlkjihgfedcba654321';

describe('pickWatchlistShareUrl', () => {
  it('reads camelCase and PascalCase shareUrl fields', () => {
    expect(pickWatchlistShareUrl({ shareUrl: URL_A })).toBe(URL_A);
    expect(pickWatchlistShareUrl({ ShareUrl: URL_B })).toBe(URL_B);
    expect(pickWatchlistShareUrl({ shareUrl: '  ' })).toBeNull();
  });
});

describe('ensureWatchlistShareUrlForNativeSheet', () => {
  it('enables sharing when inactive', async () => {
    const enableShare = jest.fn().mockResolvedValue({ shareUrl: URL_A });
    const rotateShare = jest.fn();

    const url = await ensureWatchlistShareUrlForNativeSheet(WATCHLIST_ID, {
      getStatus: async () => ({ isSharingEnabled: false }),
      enableShare,
      rotateShare,
    });

    expect(url).toBe(URL_A);
    expect(enableShare).toHaveBeenCalledWith(WATCHLIST_ID);
    expect(rotateShare).not.toHaveBeenCalled();
  });

  it('rotates link when sharing is already active', async () => {
    const enableShare = jest.fn();
    const rotateShare = jest.fn().mockResolvedValue({ shareUrl: URL_B });

    const url = await ensureWatchlistShareUrlForNativeSheet(WATCHLIST_ID, {
      getStatus: async () => ({ isSharingEnabled: true }),
      enableShare,
      rotateShare,
    });

    expect(url).toBe(URL_B);
    expect(rotateShare).toHaveBeenCalledWith(WATCHLIST_ID);
    expect(enableShare).not.toHaveBeenCalled();
  });

  it('falls back to enable when rotate returns no url', async () => {
    const rotateShare = jest.fn().mockResolvedValue({ shareUrl: null });
    const enableShare = jest.fn().mockResolvedValue({ shareUrl: URL_A });

    const url = await ensureWatchlistShareUrlForNativeSheet(WATCHLIST_ID, {
      getStatus: async () => ({ isSharingEnabled: true }),
      enableShare,
      rotateShare,
    });

    expect(url).toBe(URL_A);
    expect(rotateShare).toHaveBeenCalled();
    expect(enableShare).toHaveBeenCalled();
  });
});
