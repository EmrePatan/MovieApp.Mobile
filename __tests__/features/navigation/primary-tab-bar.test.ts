import { readFileSync } from 'node:fs';
import path from 'node:path';
import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import { resolveActivePrimaryTab } from '@/features/navigation/primary-tab-routes';
import { resolveBottomNavVisibility } from '@/features/navigation/bottom-nav-visibility';

describe('PrimaryTabBar presentation semantics', () => {
  it('derives highlighted primary tab state from pathname semantics', () => {
    expect(resolveActivePrimaryTab('/home')).toBe('home');
    expect(resolveActivePrimaryTab('/discover')).toBe('discover');
    expect(resolveActivePrimaryTab('/library')).toBe('library');
    expect(resolveActivePrimaryTab('/insights')).toBe('insights');
    expect(resolveActivePrimaryTab('/movie/123')).toBeNull();
    expect(resolveActivePrimaryTab('/tv/123')).toBeNull();
    expect(resolveActivePrimaryTab('/person/123')).toBeNull();
    expect(resolveActivePrimaryTab('/collection/123')).toBeNull();
    expect(resolveActivePrimaryTab('/movie/123/reviews')).toBeNull();
  });

  it('keeps the bottom bar visible on neutral detail routes', () => {
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'movie', '[id]'])).toBe('show');
    expect(resolveBottomNavVisibility(['(tabs)', '(app-shell)', 'tv', '[id]', 'reviews'])).toBe(
      'show',
    );
  });

  it('uses highlightedTab null styling and root-reset presses from detail routes', () => {
    const tabBar = readFileSync(
      path.join(process.cwd(), 'src/features/navigation/PrimaryTabBar.tsx'),
      'utf8',
    );

    expect(tabBar).toContain('const highlightedTab = resolveActivePrimaryTab(pathname)');
    expect(tabBar).toContain('const isActive = highlightedTab === tab.id');
    expect(tabBar).toContain('highlightedTab,');

    const router = { navigate: jest.fn(), dismissTo: jest.fn() };
    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/movie/123',
      highlightedTab: resolveActivePrimaryTab('/movie/123'),
      router: router as never,
      emitReselect: jest.fn(),
    });

    expect(router.dismissTo).toHaveBeenCalledWith('/home');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
