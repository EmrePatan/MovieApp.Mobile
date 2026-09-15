import {
  discoveryBrowseInfiniteQueryKey,
  genresQueryKey,
} from '@/features/discovery/hooks/discovery-query-keys';

describe('discovery query keys', () => {
  it('uses stable browse and genres keys', () => {
    expect(
      discoveryBrowseInfiniteQueryKey(
        'trending',
        'movie',
        {
          genreIds: ['genre-1'],
          year: 2020,
          minRating: 7,
          language: 'en',
          sort: 'rating_desc',
        },
        20,
      ),
    ).toEqual([
      'discovery',
      'browse',
      'trending',
      'movie',
      ['genre-1'],
      2020,
      7,
      'en',
      'rating_desc',
      20,
    ]);

    expect(genresQueryKey()).toEqual(['genres']);
  });
});
