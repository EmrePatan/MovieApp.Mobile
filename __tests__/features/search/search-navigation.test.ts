import { buildCatalogDetailRoute } from '@/features/details/shared/routes';

describe('catalog detail routes', () => {
  it('builds movie and tv detail routes', () => {
    expect(buildCatalogDetailRoute('movie-id', 'movie')).toBe('/movie/movie-id');
    expect(buildCatalogDetailRoute('tv-id', 'tv')).toBe('/tv/tv-id');
  });
});
