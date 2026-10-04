import {
  clearAppShellTabOrigin,
  rememberAppShellTabOrigin,
} from '@/features/navigation/app-shell-tab-origin';
import { resolveActivePrimaryTab } from '@/features/navigation/primary-tab-routes';
import { openLibraryStackScreen, resetLibraryStackNavigationForTests } from '@/features/library/navigation/library-stack-navigation';
import { openComingUpScreen } from '@/features/upcoming/navigation/coming-up-navigation';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';

describe('See All primary tab origin', () => {
  beforeEach(() => {
    resetLibraryStackNavigationForTests();
    clearAppShellTabOrigin();
  });

  it('keeps Home active after Home opens Trending See All', () => {
    const router = { push: jest.fn() } as never;

    openLibraryStackScreen(
      router,
      '/discover-browse?mode=trending&type=all',
      '/(tabs)/home',
    );

    expect(resolveActivePrimaryTab('/discover-browse?mode=trending&type=all')).toBe('home');
  });

  it('keeps Discover active after Discover opens a browse See All', () => {
    const router = { push: jest.fn() } as never;

    openLibraryStackScreen(
      router,
      createDiscoverHref({ mode: 'popular', type: 'all' }),
      '/(tabs)/discover',
    );

    expect(resolveActivePrimaryTab('/discover-browse?mode=popular&type=all')).toBe('discover');
  });

  it('keeps Library active after Library opens Upcoming See All', () => {
    const router = { push: jest.fn() } as never;

    openComingUpScreen(router, 'upcoming', '/(tabs)/library');

    expect(resolveActivePrimaryTab('/upcoming?tab=upcoming')).toBe('library');
  });

  it('keeps Home active after Home opens Coming Up See All', () => {
    const router = { push: jest.fn() } as never;

    openComingUpScreen(router, 'for-you', '/(tabs)/home');

    expect(resolveActivePrimaryTab('/upcoming?tab=for-you')).toBe('home');
  });

  it('falls back to route ownership without a remembered origin', () => {
    expect(resolveActivePrimaryTab('/discover-browse')).toBe('discover');
    expect(resolveActivePrimaryTab('/upcoming')).toBe('library');
  });

  it('ignores remembered origin on primary tab roots', () => {
    rememberAppShellTabOrigin('/(tabs)/home');
    expect(resolveActivePrimaryTab('/home')).toBe('home');
    expect(resolveActivePrimaryTab('/discover')).toBe('discover');
  });
});
