import {
  isCatalogDetailRoute,
  isPrimaryTabRootPath,
  resolveActivePrimaryTab,
} from '@/features/navigation/primary-tab-routes';

describe('primary tab routes', () => {
  it('maps browse and result routes to their owning primary tab', () => {
    expect(resolveActivePrimaryTab('/home')).toBe('home');
    expect(resolveActivePrimaryTab('/search')).toBe('home');
    expect(resolveActivePrimaryTab('/discover-browse')).toBe('discover');
    expect(resolveActivePrimaryTab('/world-cinema')).toBe('discover');
    expect(resolveActivePrimaryTab('/upcoming')).toBe('library');
    expect(resolveActivePrimaryTab('/watchlist/123')).toBe('library');
    expect(resolveActivePrimaryTab('/pick-something')).toBe('insights');
    expect(resolveActivePrimaryTab('/discover')).toBe('discover');
    expect(resolveActivePrimaryTab('/library')).toBe('library');
    expect(resolveActivePrimaryTab('/insights')).toBe('insights');
  });

  it('returns no highlighted primary tab on catalog detail routes and children', () => {
    expect(resolveActivePrimaryTab('/movie/abc')).toBeNull();
    expect(resolveActivePrimaryTab('/tv/abc')).toBeNull();
    expect(resolveActivePrimaryTab('/person/42')).toBeNull();
    expect(resolveActivePrimaryTab('/collection/99')).toBeNull();
    expect(resolveActivePrimaryTab('/movie/abc/reviews')).toBeNull();
    expect(resolveActivePrimaryTab('/movie/abc/credits')).toBeNull();
    expect(resolveActivePrimaryTab('/tv/abc/season/1')).toBeNull();
    expect(resolveActivePrimaryTab('/tv/abc/season/1/episode/2')).toBeNull();
  });

  it('identifies catalog detail routes', () => {
    expect(isCatalogDetailRoute('/movie/abc')).toBe(true);
    expect(isCatalogDetailRoute('/tv/abc/reviews')).toBe(true);
    expect(isCatalogDetailRoute('/home')).toBe(false);
    expect(isCatalogDetailRoute('/discover-browse')).toBe(false);
  });

  it('identifies primary tab root paths', () => {
    expect(isPrimaryTabRootPath('home', '/home')).toBe(true);
    expect(isPrimaryTabRootPath('home', '/search')).toBe(false);
    expect(isPrimaryTabRootPath('discover', '/discover')).toBe(true);
    expect(isPrimaryTabRootPath('discover', '/discover-browse')).toBe(false);
    expect(isPrimaryTabRootPath('library', '/library')).toBe(true);
    expect(isPrimaryTabRootPath('library', '/upcoming')).toBe(false);
    expect(isPrimaryTabRootPath('insights', '/insights')).toBe(true);
    expect(isPrimaryTabRootPath('insights', '/pick-something')).toBe(false);
  });
});
