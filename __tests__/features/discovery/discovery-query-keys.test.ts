import {
  discoveryBrowseInfiniteQueryKey,
  genresQueryKey,
} from '@/features/discovery/hooks/discovery-query-keys';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';

describe('discovery query keys', () => {
  it('uses stable browse and genres keys including extended filters', () => {
    expect(
      discoveryBrowseInfiniteQueryKey(
        'trending',
        'movie',
        {
          ...createDefaultDiscoveryFilters('trending'),
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
      null,
      null,
      7,
      null,
      null,
      null,
      'en',
      null,
      [],
      [],
      'rating_desc',
      20,
    ]);

    expect(genresQueryKey()).toEqual(['genres']);
  });
});
