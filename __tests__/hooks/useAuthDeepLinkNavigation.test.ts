import { useAuthDeepLinkNavigation } from '@/hooks/useAuthDeepLinkNavigation';
import { useAuth } from '@/auth/useAuth';
import {
  captureAuthDeepLink,
  resetPendingAuthDeepLinkForTests,
} from '@/auth/pending-auth-deep-link';

jest.mock('@/auth/useAuth');

describe('useAuthDeepLinkNavigation', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetPendingAuthDeepLinkForTests();

    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
    });

    const expoRouter = jest.requireMock('expo-router');
    expoRouter.useRouter.mockReturnValue({ replace });
  });

  it('navigates to verify-email when a pending deep link exists', () => {
    captureAuthDeepLink('movieapp://verify-email?token=abc123');

    useAuthDeepLinkNavigation();

    expect(replace).toHaveBeenCalledWith({
      pathname: '/(auth)/verify-email',
      params: { token: 'abc123' },
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
