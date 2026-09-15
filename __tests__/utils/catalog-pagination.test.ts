import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';

describe('getCatalogNextPageParam', () => {
  it('returns the next page when more pages are available', () => {
    expect(getCatalogNextPageParam({ page: 1, totalPages: 3 })).toBe(2);
    expect(getCatalogNextPageParam({ page: 2, totalPages: 3 })).toBe(3);
  });

  it('returns undefined on the final page', () => {
    expect(getCatalogNextPageParam({ page: 3, totalPages: 3 })).toBeUndefined();
    expect(getCatalogNextPageParam({ page: 1, totalPages: 1 })).toBeUndefined();
  });

  it('returns undefined when there are no pages', () => {
    expect(getCatalogNextPageParam({ page: 1, totalPages: 0 })).toBeUndefined();
  });
});
