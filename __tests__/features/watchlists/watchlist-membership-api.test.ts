import { buildWatchlistMembershipPath } from '@/features/watchlists/api/routes';
import { getWatchlistMembership } from '@/features/watchlists/api/watchlists-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('watchlist membership api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds membership route', () => {
    const contentId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    expect(buildWatchlistMembershipPath('movie', contentId)).toBe(
      `/api/watchlists/membership?mediaType=movie&contentId=${contentId}`,
    );
  });

  it('loads membership with a single request', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      watchlistIds: ['watchlist-1'],
      isInWatchlist: true,
    });

    const result = await getWatchlistMembership(
      'movie',
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );

    expect(result.isInWatchlist).toBe(true);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
