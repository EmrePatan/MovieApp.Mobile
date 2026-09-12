import {
  buildEpisodePath,
  buildMovieDetailsPath,
  buildSeasonPath,
  buildTvShowDetailsPath,
  isValidGuid,
  parsePositiveInt,
} from '@/features/details/shared/routes';
import { getEpisode } from '@/features/details/episode/api/episode-api';
import { getMovieDetails } from '@/features/details/movie/api/movie-api';
import { getSeason } from '@/features/details/season/api/season-api';
import { getTvShowDetails } from '@/features/details/tv/api/tv-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('details api routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds exact movie detail route', () => {
    expect(buildMovieDetailsPath(movieId)).toBe(`/api/movies/${movieId}`);
  });

  it('builds exact tv show detail route', () => {
    expect(buildTvShowDetailsPath(tvShowId)).toBe(`/api/tvshows/${tvShowId}`);
  });

  it('builds exact season route with encoded path segments', () => {
    expect(buildSeasonPath(tvShowId, 2)).toBe(`/api/tvshows/${tvShowId}/seasons/2`);
  });

  it('builds exact episode route with encoded path segments', () => {
    expect(buildEpisodePath(tvShowId, 1, 3)).toBe(
      `/api/tvshows/${tvShowId}/seasons/1/episodes/3`,
    );
  });

  it('calls the central api client for movie details without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ id: movieId });
    await getMovieDetails(movieId);
    expect(api.get).toHaveBeenCalledWith(`/api/movies/${movieId}`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('calls the central api client for tv show details without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ id: tvShowId });
    await getTvShowDetails(tvShowId);
    expect(api.get).toHaveBeenCalledWith(`/api/tvshows/${tvShowId}`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('calls the central api client for season details without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ seasonNumber: 1 });
    await getSeason(tvShowId, 1);
    expect(api.get).toHaveBeenCalledWith(`/api/tvshows/${tvShowId}/seasons/1`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('calls the central api client for episode details without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ episodeNumber: 3 });
    await getEpisode(tvShowId, 1, 3);
    expect(api.get).toHaveBeenCalledWith(
      `/api/tvshows/${tvShowId}/seasons/1/episodes/3`,
      {
        authenticated: false,
        signal: undefined,
      },
    );
  });
});

describe('details route helpers', () => {
  it('validates guids', () => {
    expect(isValidGuid(movieId)).toBe(true);
    expect(isValidGuid('not-a-guid')).toBe(false);
  });

  it('parses positive integers', () => {
    expect(parsePositiveInt('1')).toBe(1);
    expect(parsePositiveInt('0')).toBeNull();
    expect(parsePositiveInt('abc')).toBeNull();
  });
});
