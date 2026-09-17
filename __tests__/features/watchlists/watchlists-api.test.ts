import {
  buildAddMovieToWatchlistPath,
  buildAddTvToWatchlistPath,
  buildRemoveMovieFromWatchlistPath,
  buildRemoveTvFromWatchlistPath,
  buildWatchlistItemsPath,
  buildWatchlistPath,
  buildWatchlistsPath,
} from '@/features/watchlists/api/routes';
import {
  addMovieToWatchlist,
  addTvToWatchlist,
  createWatchlist,
  deleteWatchlist,
  updateWatchlist,
  getWatchlist,
  getWatchlistItems,
  getWatchlists,
  removeMovieFromWatchlist,
  removeTvFromWatchlist,
} from '@/features/watchlists/api/watchlists-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const watchlistId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const movieId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const tvShowId = '11111111-1111-4111-8111-111111111111';

describe('watchlists api routes', () => {
  it('builds watchlist routes', () => {
    expect(buildWatchlistsPath()).toBe('/api/watchlists');
    expect(buildWatchlistPath(watchlistId)).toBe(`/api/watchlists/${watchlistId}`);
    expect(buildWatchlistItemsPath(watchlistId, 1, 20)).toBe(
      `/api/watchlists/${watchlistId}/items?page=1&pageSize=20`,
    );
  });

  it('builds watchlist item mutation routes', () => {
    expect(buildAddMovieToWatchlistPath(watchlistId, movieId)).toBe(
      `/api/watchlists/${watchlistId}/movies/${movieId}`,
    );
    expect(buildRemoveMovieFromWatchlistPath(watchlistId, movieId)).toBe(
      `/api/watchlists/${watchlistId}/movies/${movieId}`,
    );
    expect(buildAddTvToWatchlistPath(watchlistId, tvShowId)).toBe(
      `/api/watchlists/${watchlistId}/tvshows/${tvShowId}`,
    );
    expect(buildRemoveTvFromWatchlistPath(watchlistId, tvShowId)).toBe(
      `/api/watchlists/${watchlistId}/tvshows/${tvShowId}`,
    );
  });
});

describe('watchlists api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads watchlists', async () => {
    (api.get as jest.Mock).mockResolvedValue([]);
    await getWatchlists();
    expect(api.get).toHaveBeenCalledWith('/api/watchlists', { signal: undefined });
  });

  it('creates a watchlist', async () => {
    (api.post as jest.Mock).mockResolvedValue({ id: watchlistId, name: 'My List' });
    await createWatchlist('My List');
    expect(api.post).toHaveBeenCalledWith('/api/watchlists', { name: 'My List' });
  });

  it('updates a watchlist name', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ id: watchlistId, name: 'Renamed List' });
    await updateWatchlist(watchlistId, 'Renamed List');
    expect(api.patch).toHaveBeenCalledWith(`/api/watchlists/${watchlistId}`, {
      name: 'Renamed List',
    });
  });

  it('deletes a watchlist', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);
    await deleteWatchlist(watchlistId);
    expect(api.delete).toHaveBeenCalledWith(`/api/watchlists/${watchlistId}`);
  });

  it('loads watchlist detail and items', async () => {
    (api.get as jest.Mock).mockResolvedValue({ movies: [], tvShows: [] });
    await getWatchlist(watchlistId);
    await getWatchlistItems(watchlistId, 1, 20);
    expect(api.get).toHaveBeenCalledWith(`/api/watchlists/${watchlistId}`, { signal: undefined });
    expect(api.get).toHaveBeenCalledWith(
      `/api/watchlists/${watchlistId}/items?page=1&pageSize=20`,
      { signal: undefined },
    );
  });

  it('adds and removes movie items', async () => {
    (api.post as jest.Mock).mockResolvedValue(undefined);
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await addMovieToWatchlist(watchlistId, movieId);
    await removeMovieFromWatchlist(watchlistId, movieId);

    expect(api.post).toHaveBeenCalledWith(
      `/api/watchlists/${watchlistId}/movies/${movieId}`,
    );
    expect(api.delete).toHaveBeenCalledWith(
      `/api/watchlists/${watchlistId}/movies/${movieId}`,
    );
  });

  it('adds and removes tv items', async () => {
    (api.post as jest.Mock).mockResolvedValue(undefined);
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await addTvToWatchlist(watchlistId, tvShowId);
    await removeTvFromWatchlist(watchlistId, tvShowId);

    expect(api.post).toHaveBeenCalledWith(
      `/api/watchlists/${watchlistId}/tvshows/${tvShowId}`,
    );
    expect(api.delete).toHaveBeenCalledWith(
      `/api/watchlists/${watchlistId}/tvshows/${tvShowId}`,
    );
  });
});
