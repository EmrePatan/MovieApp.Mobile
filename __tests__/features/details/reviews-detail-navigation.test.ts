import {
  isReviewsDetailRoute,
  openReviewsDetail,
  returnToCatalogDetailFromReviews,
  returnToCatalogDetailFromReviewsPathname,
} from '@/features/details/shared/navigation/reviews-detail-navigation';
import {
  buildMovieReviewsRoute,
  buildTvReviewsRoute,
} from '@/features/details/shared/routes';

describe('reviews detail navigation', () => {
  it('builds movie and tv review routes with title', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

    expect(buildMovieReviewsRoute(movieId, { title: 'Interstellar' })).toBe(
      `/movie/${movieId}/reviews?title=Interstellar`,
    );
    expect(buildTvReviewsRoute(tvShowId, { title: 'Breaking Bad' })).toBe(
      `/tv/${tvShowId}/reviews?title=Breaking+Bad`,
    );
  });

  it('detects reviews detail routes in the catalog stack', () => {
    expect(isReviewsDetailRoute(['movie', 'id', 'reviews'])).toBe(true);
    expect(isReviewsDetailRoute(['tv', 'id', 'reviews'])).toBe(true);
    expect(isReviewsDetailRoute(['movie', 'id'])).toBe(false);
    expect(isReviewsDetailRoute(['(tabs)', 'reviews', 'movie', 'id'])).toBe(false);
  });

  it('returns to catalog detail with a single back when history exists', () => {
    const back = jest.fn();
    const navigate = jest.fn();
    const router = { back, navigate, canGoBack: () => true } as never;
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    returnToCatalogDetailFromReviewsPathname(
      router,
      `/movie/${movieId}/reviews?title=Interstellar`,
    );

    expect(back).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to navigate when there is no back history', () => {
    const back = jest.fn();
    const navigate = jest.fn();
    const router = { back, navigate, canGoBack: () => false } as never;
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    returnToCatalogDetailFromReviews(router, 'movie', movieId);

    expect(back).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(`/movie/${movieId}`);
  });

  it('opens reviews with a single push action in the catalog stack', () => {
    const push = jest.fn();
    const router = { push } as never;

    openReviewsDetail(
      router,
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/reviews',
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/reviews',
      { withAnchor: true },
    );
  });
});
