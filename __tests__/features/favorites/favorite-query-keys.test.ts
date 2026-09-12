import { favoritesInfiniteQueryKey } from '@/features/favorites/hooks/favorite-query-keys';

describe('favorites infinite query keys', () => {
  it('uses favorites infinite query key', () => {
    expect(favoritesInfiniteQueryKey(20)).toEqual(['favorites', 20]);
  });
});
