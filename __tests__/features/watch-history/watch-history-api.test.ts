import {
  buildEpisodeWatchStatusPath,
  buildMarkEpisodeWatchedPath,
  buildMarkMovieWatchedPath,
  buildMovieWatchStatusPath,
  buildRecentWatchHistoryPath,
  buildSeasonProgressPath,
  buildTvShowProgressPath,
  buildUnmarkEpisodeWatchedPath,
  buildUnmarkMovieWatchedPath,
} from '@/features/watch-history/api/routes';
import {
  getEpisodeWatchStatus,
  getMovieWatchStatus,
  getRecentWatchHistory,
  getSeasonProgress,
  getTvShowProgress,
  markEpisodeWatched,
  markMovieWatched,
  unmarkEpisodeWatched,
  unmarkMovieWatched,
} from '@/features/watch-history/api/watch-history-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const episodeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('watch history api routes', () => {
  it('builds movie watch history routes', () => {
    expect(buildMarkMovieWatchedPath(movieId)).toBe(`/api/watch-history/movies/${movieId}`);
    expect(buildUnmarkMovieWatchedPath(movieId)).toBe(`/api/watch-history/movies/${movieId}`);
    expect(buildMovieWatchStatusPath(movieId)).toBe(
      `/api/watch-history/movies/${movieId}/me`,
    );
  });

  it('builds episode watch history routes', () => {
    expect(buildMarkEpisodeWatchedPath(episodeId)).toBe(
      `/api/watch-history/episodes/${episodeId}`,
    );
    expect(buildUnmarkEpisodeWatchedPath(episodeId)).toBe(
      `/api/watch-history/episodes/${episodeId}`,
    );
    expect(buildEpisodeWatchStatusPath(episodeId)).toBe(
      `/api/watch-history/episodes/${episodeId}/me`,
    );
  });

  it('builds progress and recent history routes', () => {
    expect(buildRecentWatchHistoryPath(1, 20)).toBe(
      '/api/watch-history/recent?page=1&pageSize=20',
    );
    expect(buildTvShowProgressPath(tvShowId)).toBe(
      `/api/watch-history/tvshows/${tvShowId}`,
    );
    expect(buildSeasonProgressPath(tvShowId, 1)).toBe(
      `/api/watch-history/tvshows/${tvShowId}/seasons/1`,
    );
  });
});

describe('watch history api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks and unmarks movie watched state', async () => {
    (api.post as jest.Mock).mockResolvedValue({ movieId, watchedAt: '2026-09-11T14:30:00Z' });
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await markMovieWatched(movieId);
    await unmarkMovieWatched(movieId);

    expect(api.post).toHaveBeenCalledWith(`/api/watch-history/movies/${movieId}`);
    expect(api.delete).toHaveBeenCalledWith(`/api/watch-history/movies/${movieId}`);
  });

  it('loads movie watch status', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      movieId,
      isWatched: true,
      watchedAt: '2026-09-11T14:30:00Z',
    });

    await getMovieWatchStatus(movieId);
    expect(api.get).toHaveBeenCalledWith(`/api/watch-history/movies/${movieId}/me`, {
      signal: undefined,
    });
  });

  it('marks and unmarks episode watched state', async () => {
    (api.post as jest.Mock).mockResolvedValue({ episodeId, watchedAt: '2026-09-11T14:30:00Z' });
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await markEpisodeWatched(episodeId);
    await unmarkEpisodeWatched(episodeId);

    expect(api.post).toHaveBeenCalledWith(`/api/watch-history/episodes/${episodeId}`);
    expect(api.delete).toHaveBeenCalledWith(`/api/watch-history/episodes/${episodeId}`);
  });

  it('loads episode watch status and progress endpoints', async () => {
    (api.get as jest.Mock).mockResolvedValue({});

    await getEpisodeWatchStatus(episodeId);
    await getRecentWatchHistory(1, 20);
    await getTvShowProgress(tvShowId);
    await getSeasonProgress(tvShowId, 1);

    expect(api.get).toHaveBeenCalledWith(`/api/watch-history/episodes/${episodeId}/me`, {
      signal: undefined,
    });
    expect(api.get).toHaveBeenCalledWith('/api/watch-history/recent?page=1&pageSize=20', {
      signal: undefined,
    });
    expect(api.get).toHaveBeenCalledWith(`/api/watch-history/tvshows/${tvShowId}`, {
      signal: undefined,
    });
    expect(api.get).toHaveBeenCalledWith(
      `/api/watch-history/tvshows/${tvShowId}/seasons/1`,
      { signal: undefined },
    );
  });
});
