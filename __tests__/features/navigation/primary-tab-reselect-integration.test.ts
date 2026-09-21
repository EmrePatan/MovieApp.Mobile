import { emitPrimaryTabReselect } from '@/features/navigation/primary-tab-reselect';
import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import { registerPrimaryTabReselectHandler, resetPrimaryTabReselectHandlersForTests } from '@/features/navigation/primary-tab-reselect';

describe('home primary tab reselect integration', () => {
  beforeEach(() => {
    resetPrimaryTabReselectHandlersForTests();
  });

  it('Home root reselect requests scroll-to-top and refresh exactly once with no navigation', () => {
    const scrollToTop = jest.fn();
    const refresh = jest.fn();
    const router = { navigate: jest.fn(), dismissTo: jest.fn() };

    registerPrimaryTabReselectHandler('home', { scrollToTop, refresh });

    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/home',
      activeTab: 'home',
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
