import {
  openSearch,
  parseSearchReturnOrigin,
  parseSearchScope,
  resetSearchNavigationForTests,
  returnFromSearch,
} from '@/features/navigation/search-navigation';

describe('search navigation', () => {
  beforeEach(() => {
    resetSearchNavigationForTests();
  });

  it('parses supported search return origins', () => {
    expect(parseSearchReturnOrigin('home')).toBe('home');
    expect(parseSearchReturnOrigin('discover')).toBe('discover');
    expect(parseSearchReturnOrigin('library')).toBe('library');
    expect(parseSearchReturnOrigin('search')).toBeNull();
  });

  it('parses library search scope', () => {
    expect(parseSearchScope('library')).toBe('library');
    expect(parseSearchScope('catalog')).toBe('catalog');
    expect(parseSearchScope(undefined)).toBe('catalog');
  });

  it('opens library-scoped search with query params', () => {
    const push = jest.fn();
    const router = { push } as never;

    openSearch(router, 'library', { scope: 'library' });

    expect(push).toHaveBeenCalledWith('/search?from=library&scope=library');
  });

  it('opens search with the origin query param', () => {
    const push = jest.fn();
    const router = { push } as never;

    openSearch(router, 'home');

    expect(push).toHaveBeenCalledWith('/search?from=home');
  });

  it('returns to the remembered origin', () => {
    const dismissTo = jest.fn();
    const router = { push: jest.fn(), dismissTo } as never;

    openSearch(router, 'discover');
    returnFromSearch(router);

    expect(dismissTo).toHaveBeenCalledWith('/(tabs)/discover');
  });

  it('prefers an explicit origin when returning', () => {
    const dismissTo = jest.fn();
    const router = { push: jest.fn(), dismissTo } as never;

    openSearch(router, 'discover');
    returnFromSearch(router, 'home');

    expect(dismissTo).toHaveBeenCalledWith('/(tabs)/home');
  });
});
