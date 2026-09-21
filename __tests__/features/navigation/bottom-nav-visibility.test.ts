import {
  isMainTabRouteName,
  isPersistentBottomNavRoute,
  resolveBottomNavVisibility,
} from '@/features/navigation/bottom-nav-visibility';

describe('bottom navigation visibility matrix', () => {
  it('shows the bottom bar on main tabs and nested browse/result routes', () => {
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'home'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'discover'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'search'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'upcoming'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'discover-browse'])).toBe('show');
    expect(isPersistentBottomNavRoute(['(tabs)', '(app-shell)', 'now-in-theaters'])).toBe(true);
  });

  it('shows the bottom bar on authenticated catalog detail stacks inside the app shell', () => {
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'movie', '[id]'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'tv', '[id]'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'person', '[tmdbId]'])).toBe('show');
    expect(
      resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'collection', '[tmdbId]']),
    ).toBe('show');
    expect(
      resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'movie', '[id]', 'reviews']),
    ).toBe('show');
  });

  it('hides the bottom bar on root detail stacks, auth/profile routes, and fullscreen gallery', () => {
    expect(resolveBottomNavVisibility(['movie', '[id]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['tv', '[id]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['person', '[tmdbId]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['(auth)', 'login'])).toBe('hide');
    expect(resolveBottomNavVisibility(['(auth)', 'verify-email'])).toBe('hide');
    expect(resolveBottomNavVisibility(['profile', 'edit'])).toBe('hide');
    expect(resolveBottomNavVisibility(['(tabs)', 'profile'])).toBe('hide');
    expect(
      resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'movie', '[id]', 'gallery']),
    ).toBe('hide');
  });

  it('identifies primary tab route names', () => {
    expect(isMainTabRouteName('home')).toBe(true);
    expect(isMainTabRouteName('discover')).toBe(true);
    expect(isMainTabRouteName('library')).toBe(true);
    expect(isMainTabRouteName('insights')).toBe(true);
    expect(isMainTabRouteName('search')).toBe(false);
    expect(isMainTabRouteName('movie')).toBe(false);
  });
});
