import { api } from '@/api/client';
import { getMovieCredits, getTvShowCredits } from '@/features/details/credits/api/credits-api';
import {
  buildMovieCreditsPath,
  buildTvShowCreditsPath,
} from '@/features/details/credits/api/routes';
import {
  movieCreditsQueryKey,
  tvCreditsQueryKey,
} from '@/features/details/credits/hooks/credits-query-keys';
import {
  getMovieWatchProviders,
  getTvShowWatchProviders,
} from '@/features/details/watch-providers/api/watch-providers-api';
import {
  buildMovieWatchProvidersPath,
  buildTvShowWatchProvidersPath,
} from '@/features/details/watch-providers/api/routes';
import {
  movieWatchProvidersQueryKey,
  tvWatchProvidersQueryKey,
} from '@/features/details/watch-providers/hooks/watch-providers-query-keys';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('detail enhancement api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds credits and watch-provider routes', () => {
    expect(buildMovieCreditsPath(movieId)).toBe(`/api/movies/${movieId}/credits`);
    expect(buildTvShowCreditsPath(tvShowId)).toBe(`/api/tvshows/${tvShowId}/credits`);
    expect(buildMovieWatchProvidersPath(movieId, 'TR')).toBe(
      `/api/movies/${movieId}/watch-providers?region=TR`,
    );
    expect(buildTvShowWatchProvidersPath(tvShowId, 'US')).toBe(
      `/api/tvshows/${tvShowId}/watch-providers?region=US`,
    );
  });

  it('uses stable query keys', () => {
    expect(movieCreditsQueryKey(movieId)).toEqual(['movie', movieId, 'credits']);
    expect(tvCreditsQueryKey(tvShowId)).toEqual(['tv', tvShowId, 'credits']);
    expect(movieWatchProvidersQueryKey(movieId, 'TR')).toEqual([
      'movie',
      movieId,
      'watch-providers',
      'TR',
    ]);
    expect(tvWatchProvidersQueryKey(tvShowId, 'TR')).toEqual([
      'tv',
      tvShowId,
      'watch-providers',
      'TR',
    ]);
  });

  it('calls credits endpoints without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ cast: [], crew: [] });
    await getMovieCredits(movieId);
    await getTvShowCredits(tvShowId);

    expect(api.get).toHaveBeenNthCalledWith(1, `/api/movies/${movieId}/credits`, {
      authenticated: false,
      signal: undefined,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, `/api/tvshows/${tvShowId}/credits`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('calls watch-provider endpoints without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ region: 'TR', providers: [], attributionLink: null });
    await getMovieWatchProviders(movieId, 'TR');
    await getTvShowWatchProviders(tvShowId, 'TR');

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      `/api/movies/${movieId}/watch-providers?region=TR`,
      { authenticated: false, signal: undefined },
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      `/api/tvshows/${tvShowId}/watch-providers?region=TR`,
      { authenticated: false, signal: undefined },
    );
  });
});
