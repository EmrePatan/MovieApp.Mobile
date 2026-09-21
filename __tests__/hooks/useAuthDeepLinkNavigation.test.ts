import * as Linking from 'expo-linking';
import { useAuthDeepLinkNavigation } from '@/hooks/useAuthDeepLinkNavigation';
import { useAuth } from '@/auth/useAuth';
import {
  captureAuthDeepLink,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';

jest.mock('@/auth/useAuth');

describe('useAuthDeepLinkNavigation', () => {
  const replace = jest.fn();
  let urlListener: ((event: { url: string }) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingAuthDeepLinkForTests();
    urlListener = undefined;

    (Linking.addEventListener as jest.Mock).mockImplementation(
      (_event: string, callback: (event: { url: string }) => void) => {
        urlListener = callback;
        return { remove: jest.fn() };
      },
    );

    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ replace });
    expoRouter.useSegments.mockReturnValue([]);
  });

  it('navigates to verify-email when a pending deep link exists on cold start', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');

    useAuthDeepLinkNavigation();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { token: 'abc123' },
    });
  });

  it('navigates to reset-password when a pending deep link exists on cold start', () => {
    captureAuthDeepLink('movieapp://reset-password?token=reset-token');

    useAuthDeepLinkNavigation();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/reset-password',
      params: { token: 'reset-token' },
    });
  });

  it('routes warm and background reset-password links while the app is running', () => {
    useAuthDeepLinkNavigation();

    urlListener?.({ url: 'movieapp://reset-password?token=warm-reset-token' });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/reset-password',
      params: { token: 'warm-reset-token' },
    });
  });

  it('routes warm and background verification links while the app is running', () => {
    useAuthDeepLinkNavigation();

    urlListener?.({ url: 'movieapp://verify-email?token=warm-verify-token' });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { token: 'warm-verify-token' },
    });
  });

  it('waits until auth bootstrap finishes', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
    });

    useAuthDeepLinkNavigation();

    expect(replace).not.toHaveBeenCalled();
  });
});
