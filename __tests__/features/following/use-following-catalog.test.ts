import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';

describe('useFollowingCatalog pagination', () => {
  it('derives the next page from page and totalPages', () => {
    expect(getCatalogNextPageParam({ page: 1, totalPages: 2 })).toBe(2);
    expect(getCatalogNextPageParam({ page: 2, totalPages: 2 })).toBeUndefined();
  });
});
