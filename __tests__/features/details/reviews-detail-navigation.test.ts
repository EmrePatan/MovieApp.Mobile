import {
  isReviewsDetailRoute,
  openReviewsDetail,
  resetReviewsDetailNavigationForTests,
  returnFromReviewsDetail,
} from '@/features/details/shared/navigation/reviews-detail-navigation';
import {
  buildMovieReviewsRoute,
  buildTvReviewsRoute,
} from '@/features/details/shared/routes';

describe('reviews detail navigation', () => {
  beforeEach(() => {
    resetReviewsDetailNavigationForTests();
  });

  it('builds movie and tv review routes with title', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

    expect(buildMovieReviewsRoute(movieId, { title: 'Interstellar' })).toBe(
      `/reviews/movie/${movieId}?title=Interstellar`,
    );
    expect(buildTvReviewsRoute(tvShowId, { title: 'Breaking Bad' })).toBe(
      `/reviews/tv/${tvShowId}?title=Breaking+Bad`,
    );
  });

  it('detects reviews detail routes in the tab stack', () => {
    expect(isReviewsDetailRoute(['(tabs)', 'reviews', 'movie', 'id'])).toBe(true);
    expect(isReviewsDetailRoute(['(tabs)', 'movie', 'id'])).toBe(false);
  });

  it('returns to the screen that opened reviews', () => {
    const navigate = jest.fn();
    const router = {
      push: jest.fn(),
      navigate,
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openReviewsDetail(
      router,
      '/reviews/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    returnFromReviewsDetail(router);

    expect(navigate).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});
