import {
  buildDeleteMovieRatingPath,
  buildDeleteTvRatingPath,
  buildMovieMyRatingPath,
  buildMovieRatingAggregatePath,
  buildRateMoviePath,
  buildRateTvShowPath,
  buildTvMyRatingPath,
  buildTvRatingAggregatePath,
} from '@/features/ratings/api/routes';
import {
  deleteMovieRating,
  deleteTvRating,
  getMovieMyRating,
  getMovieRatingAggregate,
  getTvMyRating,
  getTvRatingAggregate,
  rateMovie,
  rateTvShow,
} from '@/features/ratings/api/ratings-api';
import { ApiError } from '@/api/errors';
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

describe('ratings api routes', () => {
  it('builds movie rating routes', () => {
    expect(buildRateMoviePath(movieId)).toBe(`/api/ratings/movies/${movieId}`);
    expect(buildDeleteMovieRatingPath(movieId)).toBe(`/api/ratings/movies/${movieId}`);
    expect(buildMovieMyRatingPath(movieId)).toBe(`/api/ratings/movies/${movieId}/me`);
    expect(buildMovieRatingAggregatePath(movieId)).toBe(`/api/ratings/movies/${movieId}`);
  });

  it('builds tv rating routes', () => {
    expect(buildRateTvShowPath(tvShowId)).toBe(`/api/ratings/tvshows/${tvShowId}`);
    expect(buildDeleteTvRatingPath(tvShowId)).toBe(`/api/ratings/tvshows/${tvShowId}`);
    expect(buildTvMyRatingPath(tvShowId)).toBe(`/api/ratings/tvshows/${tvShowId}/me`);
    expect(buildTvRatingAggregatePath(tvShowId)).toBe(`/api/ratings/tvshows/${tvShowId}`);
  });
});

describe('ratings api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads own movie rating and returns null on 404', async () => {
    (api.get as jest.Mock).mockRejectedValue(new ApiError({ kind: 'not_found', status: 404 }));
    await expect(getMovieMyRating(movieId)).resolves.toBeNull();
  });

  it('loads public movie rating aggregate without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ averageScore: 7.5, ratingCount: 10, scoreDistribution: {} });
    await getMovieRatingAggregate(movieId);
    expect(api.get).toHaveBeenCalledWith(`/api/ratings/movies/${movieId}`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('submits movie rating with score body', async () => {
    (api.post as jest.Mock).mockResolvedValue({ score: 8 });
    await rateMovie(movieId, 8);
    expect(api.post).toHaveBeenCalledWith(`/api/ratings/movies/${movieId}`, { score: 8 });
  });

  it('deletes movie rating', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);
    await deleteMovieRating(movieId);
    expect(api.delete).toHaveBeenCalledWith(`/api/ratings/movies/${movieId}`);
  });

  it('loads own tv rating', async () => {
    (api.get as jest.Mock).mockResolvedValue({ score: 9 });
    await getTvMyRating(tvShowId);
    expect(api.get).toHaveBeenCalledWith(`/api/ratings/tvshows/${tvShowId}/me`, {
      signal: undefined,
    });
  });

  it('loads public tv rating aggregate without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ averageScore: 8.1, ratingCount: 3, scoreDistribution: {} });
    await getTvRatingAggregate(tvShowId);
    expect(api.get).toHaveBeenCalledWith(`/api/ratings/tvshows/${tvShowId}`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('submits and deletes tv ratings', async () => {
    (api.post as jest.Mock).mockResolvedValue({ score: 7 });
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await rateTvShow(tvShowId, 7);
    await deleteTvRating(tvShowId);

    expect(api.post).toHaveBeenCalledWith(`/api/ratings/tvshows/${tvShowId}`, { score: 7 });
    expect(api.delete).toHaveBeenCalledWith(`/api/ratings/tvshows/${tvShowId}`);
  });
});
