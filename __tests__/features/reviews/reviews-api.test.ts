import {
  buildCreateMovieReviewPath,
  buildCreateTvReviewPath,
  buildDeleteMovieReviewPath,
  buildDeleteTvReviewPath,
  buildMovieMyReviewPath,
  buildMovieReviewsPath,
  buildTvMyReviewPath,
  buildTvReviewsPath,
  buildUpdateMovieReviewPath,
  buildUpdateTvReviewPath,
  buildReviewTranslationPath,
} from '@/features/reviews/api/routes';
import {
  createMovieReview,
  createTvReview,
  deleteMovieReview,
  deleteTvReview,
  getMovieMyReview,
  getMovieReviews,
  getTvMyReview,
  getTvReviews,
  updateMovieReview,
  updateTvReview,
} from '@/features/reviews/api/reviews-api';
import { ApiError } from '@/api/errors';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('reviews api routes', () => {
  it('builds movie review routes', () => {
    expect(buildMovieReviewsPath(movieId, 1, 20)).toBe(
      `/api/reviews/movies/${movieId}?page=1&pageSize=20`,
    );
    expect(buildMovieReviewsPath(movieId, 2, 10, 'ratingDesc')).toBe(
      `/api/reviews/movies/${movieId}?page=2&pageSize=10&sort=ratingDesc`,
    );
    expect(buildMovieMyReviewPath(movieId)).toBe(`/api/reviews/movies/${movieId}/me`);
    expect(buildCreateMovieReviewPath(movieId)).toBe(`/api/reviews/movies/${movieId}`);
    expect(buildUpdateMovieReviewPath(movieId)).toBe(`/api/reviews/movies/${movieId}`);
    expect(buildDeleteMovieReviewPath(movieId)).toBe(`/api/reviews/movies/${movieId}`);
  });

  it('builds review translation route', () => {
    expect(buildReviewTranslationPath('review-123')).toBe('/api/reviews/review-123/translation');
  });

  it('builds tv review routes', () => {
    expect(buildTvReviewsPath(tvShowId, 2, 10)).toBe(
      `/api/reviews/tvshows/${tvShowId}?page=2&pageSize=10`,
    );
    expect(buildTvMyReviewPath(tvShowId)).toBe(`/api/reviews/tvshows/${tvShowId}/me`);
    expect(buildCreateTvReviewPath(tvShowId)).toBe(`/api/reviews/tvshows/${tvShowId}`);
    expect(buildUpdateTvReviewPath(tvShowId)).toBe(`/api/reviews/tvshows/${tvShowId}`);
    expect(buildDeleteTvReviewPath(tvShowId)).toBe(`/api/reviews/tvshows/${tvShowId}`);
  });
});

describe('reviews api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads public movie reviews without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    await getMovieReviews(movieId, 1, 20, 'newest');

    expect(api.get).toHaveBeenCalledWith(
      `/api/reviews/movies/${movieId}?page=1&pageSize=20&sort=newest`,
      {
      authenticated: false,
      signal: undefined,
      },
    );
  });

  it('loads public tv reviews without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    await getTvReviews(tvShowId, 1, 20);

    expect(api.get).toHaveBeenCalledWith(`/api/reviews/tvshows/${tvShowId}?page=1&pageSize=20`, {
      authenticated: false,
      signal: undefined,
    });
  });

  it('loads own movie review and returns null on 404', async () => {
    (api.get as jest.Mock).mockRejectedValue(new ApiError({ kind: 'not_found', status: 404 }));
    await expect(getMovieMyReview(movieId)).resolves.toBeNull();
  });

  it('loads own tv review and returns null on 404', async () => {
    (api.get as jest.Mock).mockRejectedValue(new ApiError({ kind: 'not_found', status: 404 }));
    await expect(getTvMyReview(tvShowId)).resolves.toBeNull();
  });

  it('creates movie review with content body', async () => {
    (api.post as jest.Mock).mockResolvedValue({ id: 'review-id' });
    await createMovieReview(movieId, { content: 'Great film.' });
    expect(api.post).toHaveBeenCalledWith(`/api/reviews/movies/${movieId}`, {
      content: 'Great film.',
    });
  });

  it('creates tv review with content body', async () => {
    (api.post as jest.Mock).mockResolvedValue({ id: 'review-id' });
    await createTvReview(tvShowId, { content: 'Great show.' });
    expect(api.post).toHaveBeenCalledWith(`/api/reviews/tvshows/${tvShowId}`, {
      content: 'Great show.',
    });
  });

  it('updates movie review', async () => {
    (api.put as jest.Mock).mockResolvedValue({ id: 'review-id' });
    await updateMovieReview(movieId, { content: 'Updated review.' });
    expect(api.put).toHaveBeenCalledWith(`/api/reviews/movies/${movieId}`, {
      content: 'Updated review.',
    });
  });

  it('updates tv review', async () => {
    (api.put as jest.Mock).mockResolvedValue({ id: 'review-id' });
    await updateTvReview(tvShowId, { content: 'Updated review.' });
    expect(api.put).toHaveBeenCalledWith(`/api/reviews/tvshows/${tvShowId}`, {
      content: 'Updated review.',
    });
  });

  it('deletes movie and tv reviews', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await deleteMovieReview(movieId);
    await deleteTvReview(tvShowId);

    expect(api.delete).toHaveBeenCalledWith(`/api/reviews/movies/${movieId}`);
    expect(api.delete).toHaveBeenCalledWith(`/api/reviews/tvshows/${tvShowId}`);
  });
});
