import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/auth/useAuth';

jest.mock('@/auth/useAuth');

describe('useProtectedRoute', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('does nothing while auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });
});
