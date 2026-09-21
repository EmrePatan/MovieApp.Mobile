import {
  isMainTabRouteName,
  isPersistentBottomNavRoute,
  resolveBottomNavVisibility,
} from '@/features/navigation/bottom-nav-visibility';

describe('bottom navigation visibility matrix', () => {
  it('shows the bottom bar on main tabs and nested browse/result routes', () => {
    expect(resolveBottomNavVisibility(['(tabs)', 'home'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', 'discover'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', 'search'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', 'upcoming'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', 'discover-browse'])).toBe('show');
    expect(isPersistentBottomNavRoute(['(tabs)', 'now-in-theaters'])).toBe(true);
  });

  it('hides the bottom bar on root detail stacks and auth/profile routes', () => {
    expect(resolveBottomNavVisibility(['movie', '[id]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['tv', '[id]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['person', '[tmdbId]'])).toBe('hide');
    expect(resolveBottomNavVisibility(['(auth)', 'login'])).toBe('hide');
    expect(resolveBottomNavVisibility(['(auth)', 'verify-email'])).toBe('hide');
    expect(resolveBottomNavVisibility(['profile', 'edit'])).toBe('hide');
    expect(resolveBottomNavVisibility(['movie', '[id]', 'gallery'])).toBe('hide');
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
