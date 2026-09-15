import { buildCollectionDetailRoute } from '@/features/details/shared/routes';

describe('collection routes', () => {
  it('builds the collection detail route from a tmdb id', () => {
    expect(buildCollectionDetailRoute(9485)).toBe('/collection/9485');
  });
});
