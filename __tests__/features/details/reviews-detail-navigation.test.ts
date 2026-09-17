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

  it('opens reviews with a single push action', () => {
    const push = jest.fn();
    const router = {
      push,
      dismissTo: jest.fn(),
      navigate: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openReviewsDetail(
      router,
      '/reviews/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      '/reviews/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
  });

  it('returns to the screen that opened reviews by dismissing to origin', () => {
    const dismissTo = jest.fn();
    const router = {
      push: jest.fn(),
      dismissTo,
      navigate: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openReviewsDetail(
      router,
      '/reviews/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    returnFromReviewsDetail(router);

    expect(dismissTo).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});
