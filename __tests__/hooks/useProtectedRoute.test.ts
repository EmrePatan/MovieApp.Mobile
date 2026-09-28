import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/auth/useAuth';
import {
  captureAuthDeepLink,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';
import {
  captureCatalogDeepLink,
  peekPendingCatalogDeepLinkPath,
  resetPendingCatalogDeepLinkForTests,
} from '@/auth/pending-catalog-deep-link';

jest.mock('@/auth/useAuth');

describe('useProtectedRoute', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingAuthDeepLinkForTests();
    resetPendingCatalogDeepLinkForTests();
    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ replace });
    expoRouter.usePathname.mockReturnValue('');
  });

  it('redirects unauthenticated users to login', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(tabs)', 'home']);

    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('redirects authenticated users away from auth screens', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'login']);

    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('allows authenticated users to stay on verify-email', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'verify-email']);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });

  it('allows authenticated users to stay on reset-password', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'reset-password']);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });

  it('does not redirect away while a pending auth deep link is waiting to restore', () => {
    captureAuthDeepLink('movieapp://reset-password?token=stale-session-token');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(tabs)', 'home']);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });

  it('allows unauthenticated users to remain on verify-email during token flow', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'verify-email']);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });

  it('keeps a shared catalog link queued while the user is signed out', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    captureCatalogDeepLink(`https://moviecaveapp.com/movie/${movieId}`);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(tabs)', 'home']);

    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith('/(auth)/login');
    expect(peekPendingCatalogDeepLinkPath()).toBe(`/movie/${movieId}`);
  });

  it('opens a pending catalog link after login instead of home', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    captureCatalogDeepLink(`https://moviecaveapp.com/movie/${movieId}`);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'login']);
    expoRouter.usePathname.mockReturnValue('/(auth)/login');

    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith(`/movie/${movieId}`);
    expect(replace).not.toHaveBeenCalledWith('/(tabs)/home');
    expect(peekPendingCatalogDeepLinkPath()).toBeNull();
  });

  it('does not navigate again when the pending catalog link is already open', () => {
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    captureCatalogDeepLink(`movieapp://movie/${movieId}`);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(tabs)', '(app-shell)', 'movie', movieId]);
    expoRouter.usePathname.mockReturnValue(`/movie/${movieId}`);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
    expect(peekPendingCatalogDeepLinkPath()).toBeNull();
  });

  it('does nothing while auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });
});
