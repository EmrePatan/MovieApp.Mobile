import {
  openLibraryStackScreen,
  resetLibraryStackNavigationForTests,
  returnFromLibraryStackScreen,
} from '@/features/library/navigation/library-stack-navigation';

describe('library stack navigation', () => {
  beforeEach(() => {
    resetLibraryStackNavigationForTests();
  });

  it('opens a library screen with push and remembers the return href', () => {
    const push = jest.fn();
    const dismissTo = jest.fn();
    const router = { push, dismissTo } as never;

    openLibraryStackScreen(router, '/upcoming', '/(tabs)/home');
    returnFromLibraryStackScreen(router);

    expect(push).toHaveBeenCalledWith('/upcoming');
    expect(dismissTo).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('falls back to home when no return href was stored', () => {
    const dismissTo = jest.fn();
    const router = { dismissTo } as never;

    returnFromLibraryStackScreen(router);

    expect(dismissTo).toHaveBeenCalledWith('/(tabs)/home');
  });
});
