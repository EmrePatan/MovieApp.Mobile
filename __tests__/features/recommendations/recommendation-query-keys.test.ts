import {
  discoveryBrowseInfiniteQueryKey,
} from '@/features/discovery/hooks/discovery-query-keys';
import {
  recommendationHomeQueryKey,
  recommendationsInfiniteQueryKey,
  similarMoviesQueryKey,
  similarTvShowsQueryKey,
} from '@/features/recommendations/hooks/recommendation-query-keys';

describe('recommendation query keys', () => {
  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  it('uses recommendation keys', () => {
    expect(recommendationsInfiniteQueryKey('all', 20)).toEqual([
      'recommendations',
      'list',
      'all',
      20,
    ]);
    expect(recommendationHomeQueryKey()).toEqual(['recommendations', 'home']);
    expect(similarMoviesQueryKey(id, 20)).toEqual(['recommendations', 'similar', 'movie', id, 20]);
    expect(similarTvShowsQueryKey(id, 20)).toEqual(['recommendations', 'similar', 'tv', id, 20]);
  });
});

describe('discovery query keys', () => {
  it('uses discovery browse keys', () => {
    expect(
      discoveryBrowseInfiniteQueryKey(
        'top_rated',
        'movie',
        {
          genreIds: [],
          year: null,
          minRating: null,
          language: null,
          sort: 'rating_desc',
        },
        20,
      ),
    ).toEqual([
      'discovery',
      'browse',
      'top_rated',
      'movie',
      [],
      null,
      null,
      null,
      'rating_desc',
      20,
    ]);
  });
});
