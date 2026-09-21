import {
  emitPrimaryTabReselect,
  registerPrimaryTabReselectHandler,
  resetPrimaryTabReselectHandlersForTests,
} from '@/features/navigation/primary-tab-reselect';

describe('primary tab reselect coordinator', () => {
  beforeEach(() => {
    resetPrimaryTabReselectHandlersForTests();
  });

  it('scrolls to top and refreshes exactly once per reselect emit', () => {
    const scrollToTop = jest.fn();
    const refresh = jest.fn();

    registerPrimaryTabReselectHandler('home', { scrollToTop, refresh });
    emitPrimaryTabReselect('home');

    expect(scrollToTop).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh.mock.invocationCallOrder[0]).toBeGreaterThan(
      scrollToTop.mock.invocationCallOrder[0],
    );
  });

  it('does nothing when no handler is registered', () => {
    expect(() => emitPrimaryTabReselect('discover')).not.toThrow();
  });
});
