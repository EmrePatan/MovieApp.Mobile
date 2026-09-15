import { buildBrowsePath, buildGenresPath } from '@/features/discovery/api/routes';
import { getBrowseDiscovery, getGenres } from '@/features/discovery/api/discovery-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('discovery api routes', () => {
  it('builds browse and genres routes', () => {
    expect(buildGenresPath()).toBe('/api/genres');
    expect(
      buildBrowsePath({
        mode: 'trending',
        type: 'tv',
        page: 1,
        pageSize: 20,
        genreIds: [],
        year: null,
        minRating: null,
        language: null,
        sort: 'popularity_desc',
      }),
    ).toBe('/api/discovery/browse?mode=trending&type=tv&page=1&pageSize=20&sort=popularity_desc');

    expect(
      buildBrowsePath({
        mode: 'top_rated',
        type: 'movie',
        page: 2,
        pageSize: 10,
        genreIds: ['genre-1', 'genre-2'],
        year: 2020,
        minRating: 7.5,
        language: 'en',
        sort: 'rating_desc',
      }),
    ).toBe(
      '/api/discovery/browse?mode=top_rated&type=movie&page=2&pageSize=10&genreId=genre-1&genreId=genre-2&year=2020&minRating=7.5&language=en&sort=rating_desc',
    );
  });
});

describe('discovery api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads browse discovery without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getBrowseDiscovery({
      mode: 'new_releases',
      type: 'all',
      page: 1,
      pageSize: 20,
      genreIds: [],
      year: null,
      minRating: null,
      language: null,
      sort: 'release_desc',
    });
    expect(api.get).toHaveBeenCalledWith(
      '/api/discovery/browse?mode=new_releases&type=all&page=1&pageSize=20&sort=release_desc',
      {
        authenticated: false,
        signal: undefined,
      },
    );
  });

  it('loads genres without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue([]);
    await getGenres();
    expect(api.get).toHaveBeenCalledWith('/api/genres', {
      authenticated: false,
      signal: undefined,
    });
  });
});
