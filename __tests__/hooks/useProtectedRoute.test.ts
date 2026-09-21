import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/auth/useAuth';
import {
  captureAuthDeepLink,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';

jest.mock('@/auth/useAuth');

describe('useProtectedRoute', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingAuthDeepLinkForTests();
    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ replace });
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

  it('does nothing while auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });
});
