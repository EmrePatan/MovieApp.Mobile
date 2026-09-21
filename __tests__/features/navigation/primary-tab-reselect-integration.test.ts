import { readFileSync } from 'node:fs';
import path from 'node:path';
import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import {
  registerPrimaryTabReselectHandler,
  resetPrimaryTabReselectHandlersForTests,
} from '@/features/navigation/primary-tab-reselect';

describe('home primary tab reselect integration', () => {
  beforeEach(() => {
    resetPrimaryTabReselectHandlersForTests();
  });

  it('Home root reselect requests scroll-to-top and refresh exactly once with no navigation', () => {
    const scrollToTop = jest.fn();
    const refresh = jest.fn();
    const router = { navigate: jest.fn(), dismissAll: jest.fn(), dismissTo: jest.fn() };

    registerPrimaryTabReselectHandler('home', { scrollToTop, refresh });

    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/home',
      highlightedTab: 'home',
      router: router as never,
      emitReselect: emitPrimaryTabReselect,
    });

    expect(scrollToTop).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it('Home → Movie → Back does not invoke reselect handlers', () => {
    const scrollToTop = jest.fn();
    const refresh = jest.fn();

    registerPrimaryTabReselectHandler('home', { scrollToTop, refresh });

    expect(scrollToTop).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('home silent reselect wiring', () => {
  it('uses silent reselect refresh while preserving manual pull-to-refresh', () => {
    const homeSource = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/(app-shell)/home.tsx'),
      'utf8',
    );

    expect(homeSource).toContain('handleSilentReselectRefresh');
    expect(homeSource).toContain('refresh: handleSilentReselectRefresh');
    expect(homeSource).toContain('onRefresh: handleRefresh');
    expect(homeSource).toContain('setIsManualRefreshing(true)');
    expect(homeSource).not.toContain('refresh: handleRefresh');
  });
});
