import {
  buildMovieFavoriteStatusPath,
  buildTvFavoriteStatusPath,
} from '@/features/favorites/api/routes';
import { getMovieFavoriteStatus, getTvFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('favorite status api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds favorite status routes', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

    expect(buildMovieFavoriteStatusPath(movieId)).toBe(
      `/api/favorites/movies/${movieId}/status`,
    );
    expect(buildTvFavoriteStatusPath(tvShowId)).toBe(
      `/api/favorites/tvshows/${tvShowId}/status`,
    );
  });

  it('loads favorite status with a single request', async () => {
    (api.get as jest.Mock).mockResolvedValue({ isFavorited: true });
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    const result = await getMovieFavoriteStatus(movieId);

    expect(result.isFavorited).toBe(true);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(`/api/favorites/movies/${movieId}/status`, {
      signal: undefined,
    });

    await getTvFavoriteStatus('7c9e6679-7425-40de-944b-e07fc1f90ae7');
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
