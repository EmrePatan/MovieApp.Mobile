import { buildPopularPath, buildTrendingPath } from '@/features/discovery/api/routes';
import { getPopularDiscovery, getTrendingDiscovery } from '@/features/discovery/api/discovery-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('discovery api routes', () => {
  it('builds popular and trending routes', () => {
    expect(buildPopularPath({ page: 1, pageSize: 20, type: 'tv' })).toBe(
      '/api/discovery/popular?page=1&pageSize=20&type=tv',
    );
    expect(buildTrendingPath({ page: 2, pageSize: 10, type: 'movie' })).toBe(
      '/api/discovery/trending?page=2&pageSize=10&type=movie',
    );
  });
});

describe('discovery api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads popular discovery without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getPopularDiscovery({ page: 1, pageSize: 20, type: 'all' });
    expect(api.get).toHaveBeenCalledWith('/api/discovery/popular?page=1&pageSize=20&type=all', {
      authenticated: false,
      signal: undefined,
    });
  });

  it('loads trending discovery without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getTrendingDiscovery({ page: 1, pageSize: 20, type: 'all' });
    expect(api.get).toHaveBeenCalledWith('/api/discovery/trending?page=1&pageSize=20&type=all', {
      authenticated: false,
      signal: undefined,
    });
  });
});
