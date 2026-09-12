import {
  buildRecommendationHomePath,
  buildRecommendationsPath,
  buildSimilarMoviesPath,
  buildSimilarTvShowsPath,
} from '@/features/recommendations/api/routes';
import {
  getRecommendationHome,
  getRecommendations,
  getSimilarMovies,
  getSimilarTvShows,
} from '@/features/recommendations/api/recommendations-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('recommendations api routes', () => {
  it('builds recommendation routes', () => {
    expect(buildRecommendationsPath({ page: 2, pageSize: 10, type: 'movie' })).toBe(
      '/api/recommendations?page=2&pageSize=10&type=movie',
    );
    expect(buildRecommendationHomePath()).toBe('/api/recommendations/home');
    expect(buildSimilarMoviesPath(movieId, { page: 1, pageSize: 20 })).toBe(
      `/api/recommendations/movies/${movieId}/similar?page=1&pageSize=20`,
    );
    expect(buildSimilarTvShowsPath(tvShowId, { page: 1, pageSize: 20 })).toBe(
      `/api/recommendations/tvshows/${tvShowId}/similar?page=1&pageSize=20`,
    );
  });
});

describe('recommendations api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads personalized recommendations with auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
    await getRecommendations({ page: 1, pageSize: 20, type: 'all' });
    expect(api.get).toHaveBeenCalledWith('/api/recommendations?page=1&pageSize=20&type=all', {
      signal: undefined,
    });
  });

  it('loads recommendation home with auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ sections: [] });
    await getRecommendationHome();
    expect(api.get).toHaveBeenCalledWith('/api/recommendations/home', { signal: undefined });
  });

  it('loads similar movies without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getSimilarMovies(movieId);
    expect(api.get).toHaveBeenCalledWith(
      `/api/recommendations/movies/${movieId}/similar?page=1&pageSize=20`,
      { authenticated: false, signal: undefined },
    );
  });

  it('loads similar tv shows without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getSimilarTvShows(tvShowId);
    expect(api.get).toHaveBeenCalledWith(
      `/api/recommendations/tvshows/${tvShowId}/similar?page=1&pageSize=20`,
      { authenticated: false, signal: undefined },
    );
  });
});
