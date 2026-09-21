import * as Linking from 'expo-linking';
import { useAuthDeepLinkNavigation } from '@/hooks/useAuthDeepLinkNavigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/auth/useAuth';
import {
  captureAuthDeepLink,
  ensureAuthDeepLinkListener,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';
import { resetAuthDeepLinkTraceForTests } from '@/auth/auth-deep-link-trace';

jest.mock('@/auth/useAuth');

describe('auth cold-start lifecycle', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingAuthDeepLinkForTests();
    resetAuthDeepLinkTraceForTests();

    (Linking.getLinkingURL as jest.Mock | undefined)?.mockReturnValue?.(null);
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ replace });
    expoRouter.useSegments.mockReturnValue([]);
  });

  it('captures iOS launch URLs synchronously via getLinkingURL', () => {
    (Linking.getLinkingURL as jest.Mock).mockReturnValue(
      'movieapp://verify-email?token=sync-token',
    );

    ensureAuthDeepLinkListener();

    useAuthDeepLinkNavigation();
    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { token: 'sync-token' },
    });
    expect(replace).not.toHaveBeenCalledWith('/(auth)/login');
  });

  it('does not redirect to login while auth deep-link restore is in flight', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');

    useAuthDeepLinkNavigation();
    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { token: 'abc123' },
    });
    expect(replace).not.toHaveBeenCalledWith('/(auth)/login');
  });

  it('restores reset-password cold-start links without login eviction', () => {
    captureAuthDeepLink('movieapp://reset-password?token=reset-token');

    useAuthDeepLinkNavigation();
    useProtectedRoute();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/reset-password',
      params: { token: 'reset-token' },
    });
    expect(replace).not.toHaveBeenCalledWith('/(auth)/login');
  });

  it('allows unauthenticated users to remain on verify-email once routed', () => {
    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useSegments.mockReturnValue(['(auth)', 'verify-email']);

    useProtectedRoute();

    expect(replace).not.toHaveBeenCalled();
  });
});
