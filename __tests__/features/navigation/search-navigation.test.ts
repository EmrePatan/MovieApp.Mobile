import {
  openSearch,
  parseSearchReturnOrigin,
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
    expect(parseSearchReturnOrigin('search')).toBeNull();
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
