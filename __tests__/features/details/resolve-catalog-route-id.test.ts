import {
  parseCatalogIdFromPathname,
  resolveCatalogRouteId,
} from '@/features/details/shared/routes';

describe('resolveCatalogRouteId', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const tvId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('resolves a valid route param directly', () => {
    expect(
      resolveCatalogRouteId(movieId, ['(tabs)', 'movie', movieId], `/movie/${movieId}`, 'movie'),
    ).toBe(movieId);
  });

  it('falls back to pathname parsing when the route param is invalid', () => {
    expect(
      resolveCatalogRouteId('invalid', ['(tabs)', 'movie', movieId], `/movie/${movieId}`, 'movie'),
    ).toBe(movieId);
  });

  it('falls back to the last valid guid in segments', () => {
    expect(resolveCatalogRouteId(undefined, ['(tabs)', 'movie', movieId])).toBe(movieId);
  });

  it('returns undefined when no valid id can be resolved', () => {
    expect(resolveCatalogRouteId('invalid', ['(tabs)', 'movie', 'bad-id'])).toBeUndefined();
  });

  it('does not treat nested child destination pathnames as active catalog detail routes', () => {
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/reviews`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/credits`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/gallery`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/tv/${tvId}/reviews`, 'tv')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/tv/${tvId}/credits`, 'tv')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/tv/${tvId}/gallery`, 'tv')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}`, 'movie')).toBe(movieId);
    expect(parseCatalogIdFromPathname(`/tv/${tvId}`, 'tv')).toBe(tvId);
  });
});
