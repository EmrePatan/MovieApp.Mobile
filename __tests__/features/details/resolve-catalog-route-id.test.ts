import {
  parseCatalogIdFromPathname,
  resolveCatalogRouteId,
} from '@/features/details/shared/routes';

describe('resolveCatalogRouteId', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';

  it('prefers a valid search param id', () => {
    expect(resolveCatalogRouteId(movieId, ['(tabs)', 'movie', '[id]'])).toBe(movieId);
  });

  it('falls back to pathname when params are not ready yet', () => {
    expect(
      resolveCatalogRouteId(
        undefined,
        ['(tabs)', 'movie', '[id]'],
        `/movie/${movieId}`,
        'movie',
      ),
    ).toBe(movieId);
  });

  it('falls back to a guid segment when params are not ready yet', () => {
    expect(resolveCatalogRouteId(undefined, ['(tabs)', 'movie', movieId])).toBe(movieId);
  });

  it('returns undefined while route params and segments are unresolved', () => {
    expect(resolveCatalogRouteId(undefined, ['(tabs)', 'movie', '[id]'])).toBeUndefined();
  });
});

describe('parseCatalogIdFromPathname', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';

  it('parses movie ids from pathname', () => {
    expect(parseCatalogIdFromPathname(`/movie/${movieId}`, 'movie')).toBe(movieId);
    expect(parseCatalogIdFromPathname(`/(tabs)/movie/${movieId}`, 'movie')).toBe(movieId);
  });

  it('parses tv ids from pathname', () => {
    const tvId = 'a2ae92ef-3a02-4ac4-827b-c05ec45ba999';
    expect(parseCatalogIdFromPathname(`/tv/${tvId}`, 'tv')).toBe(tvId);
  });
});
