import { buildPersonDetailRoute } from '@/features/details/shared/routes';

describe('person routes', () => {
  it('builds the person detail route from a tmdb id', () => {
    expect(buildPersonDetailRoute(1001)).toBe('/person/1001');
  });
});
