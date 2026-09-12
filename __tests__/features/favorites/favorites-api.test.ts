import {
  buildAddMovieFavoritePath,
  buildAddTvFavoritePath,
  buildFavoritesPath,
  buildRemoveMovieFavoritePath,
  buildRemoveTvFavoritePath,
} from '@/features/favorites/api/routes';
import {
  addMovieFavorite,
  addTvFavorite,
  getFavorites,
  removeMovieFavorite,
  removeTvFavorite,
} from '@/features/favorites/api/favorites-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('favorites api routes', () => {
  it('builds movie favorite routes', () => {
    expect(buildAddMovieFavoritePath(movieId)).toBe(`/api/favorites/movies/${movieId}`);
    expect(buildRemoveMovieFavoritePath(movieId)).toBe(`/api/favorites/movies/${movieId}`);
  });

  it('builds tv favorite routes', () => {
    expect(buildAddTvFavoritePath(tvShowId)).toBe(`/api/favorites/tvshows/${tvShowId}`);
    expect(buildRemoveTvFavoritePath(tvShowId)).toBe(`/api/favorites/tvshows/${tvShowId}`);
  });

  it('builds favorites list route with pagination', () => {
    expect(buildFavoritesPath(2, 50)).toBe('/api/favorites?page=2&pageSize=50');
  });
});

describe('favorites api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads favorites through the central api client', async () => {
    (api.get as jest.Mock).mockResolvedValue({ movies: [], tvShows: [] });
    await getFavorites(1, 20);
    expect(api.get).toHaveBeenCalledWith('/api/favorites?page=1&pageSize=20', {
      signal: undefined,
    });
  });

  it('adds and removes movie favorites', async () => {
    (api.post as jest.Mock).mockResolvedValue(undefined);
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await addMovieFavorite(movieId);
    await removeMovieFavorite(movieId);

    expect(api.post).toHaveBeenCalledWith(`/api/favorites/movies/${movieId}`);
    expect(api.delete).toHaveBeenCalledWith(`/api/favorites/movies/${movieId}`);
  });

  it('adds and removes tv favorites', async () => {
    (api.post as jest.Mock).mockResolvedValue(undefined);
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await addTvFavorite(tvShowId);
    await removeTvFavorite(tvShowId);

    expect(api.post).toHaveBeenCalledWith(`/api/favorites/tvshows/${tvShowId}`);
    expect(api.delete).toHaveBeenCalledWith(`/api/favorites/tvshows/${tvShowId}`);
  });
});
