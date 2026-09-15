import {
  filterFollowingItems,
  flattenFollowingPages,
} from '@/features/following/utils/following-catalog-items';

const movieItem = {
  id: 'movie-id',
  type: 'movie' as const,
  title: 'Dune',
  posterUrl: null,
  releaseDate: '2026-12-18',
  year: 2026,
};

const tvItem = {
  id: 'tv-id',
  type: 'tv' as const,
  title: 'Severance',
  posterUrl: null,
  releaseDate: null,
  year: 2022,
};

describe('following-catalog-items', () => {
  it('flattens paginated following items without duplicates', () => {
    const items = flattenFollowingPages([
      {
        items: [movieItem, tvItem],
        page: 1,
        pageSize: 20,
        totalCount: 3,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      },
      {
        items: [movieItem],
        page: 2,
        pageSize: 20,
        totalCount: 3,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.title)).toEqual(['Dune', 'Severance']);
  });

  it('filters loaded following items by content type', () => {
    const items = [movieItem, tvItem];

    expect(filterFollowingItems(items, 'movie')).toEqual([movieItem]);
    expect(filterFollowingItems(items, 'tv')).toEqual([tvItem]);
    expect(filterFollowingItems(items, 'all')).toEqual(items);
  });
});
