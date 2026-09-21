import { handlePrimaryTabPress } from '@/features/navigation/primary-tab-press';
import { PRIMARY_TAB_HREFS } from '@/features/navigation/primary-tab-routes';

function createRouter() {
  return {
    navigate: jest.fn(),
    dismissTo: jest.fn(),
  };
}

describe('primary tab press handling', () => {
  it('reselects Home root without adding navigation history', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    const action = handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/home',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });

    expect(action).toBe('reselect');
    expect(emitReselect).toHaveBeenCalledTimes(1);
    expect(emitReselect).toHaveBeenCalledWith('home');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it('repeated Home root reselect does not navigate', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/home',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });
    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/home',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });

    expect(emitReselect).toHaveBeenCalledTimes(2);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it('returns to Home root from nested detail without forcing reselect refresh', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    const action = handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/movie/movie-a',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });

    expect(action).toBe('dismiss');
    expect(router.dismissTo).toHaveBeenCalledWith(PRIMARY_TAB_HREFS.home);
    expect(emitReselect).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('returns to Home root from nested Home flow without refresh emit', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'home',
      pathname: '/person/42',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });

    expect(router.dismissTo).toHaveBeenCalledWith('/home');
    expect(emitReselect).not.toHaveBeenCalled();
  });

  it('navigates when switching to a different primary tab', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    const action = handlePrimaryTabPress({
      tabId: 'discover',
      pathname: '/home',
      activeTab: 'home',
      router: router as never,
      emitReselect,
    });

    expect(action).toBe('navigate');
    expect(router.navigate).toHaveBeenCalledWith('/discover');
    expect(emitReselect).not.toHaveBeenCalled();
  });

  it('returns Discover root from nested discover routes without refresh emit', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'discover',
      pathname: '/discover-browse',
      activeTab: 'discover',
      router: router as never,
      emitReselect,
    });

    expect(router.dismissTo).toHaveBeenCalledWith('/discover');
    expect(emitReselect).not.toHaveBeenCalled();
  });

  it('reselects Discover root with scroll and refresh emit only on root', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'discover',
      pathname: '/discover',
      activeTab: 'discover',
      router: router as never,
      emitReselect,
    });

    expect(emitReselect).toHaveBeenCalledWith('discover');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it('returns Library root from nested library routes without refresh emit', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'library',
      pathname: '/upcoming',
      activeTab: 'library',
      router: router as never,
      emitReselect,
    });

    expect(router.dismissTo).toHaveBeenCalledWith('/library');
    expect(emitReselect).not.toHaveBeenCalled();
  });

  it('reselects Insights root without navigation', () => {
    const router = createRouter();
    const emitReselect = jest.fn();

    handlePrimaryTabPress({
      tabId: 'insights',
      pathname: '/insights',
      activeTab: 'insights',
      router: router as never,
      emitReselect,
    });

    expect(emitReselect).toHaveBeenCalledWith('insights');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.dismissTo).not.toHaveBeenCalled();
  });
});
