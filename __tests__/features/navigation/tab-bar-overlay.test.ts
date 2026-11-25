import { isTabBarOverlayActive } from '@/features/navigation/tab-bar-overlay';

describe('isTabBarOverlayActive', () => {
  const tabSegments = ['(tabs)', '(app-shell)', 'home'];

  it.each(['/home', '/discover', '/social', '/library', '/insights'])(
    'overlays the dock on the %s root',
    (pathname) => {
      expect(isTabBarOverlayActive(pathname, tabSegments)).toBe(true);
    },
  );

  it.each(['/search', '/discover-browse', '/movie/123', '/favorites', '/social/abc'])(
    'keeps the dock in flow on %s',
    (pathname) => {
      expect(isTabBarOverlayActive(pathname, tabSegments)).toBe(false);
    },
  );

  it('does not overlay when the bottom nav is hidden', () => {
    expect(isTabBarOverlayActive('/home', ['(auth)', 'login'])).toBe(false);
  });
});
