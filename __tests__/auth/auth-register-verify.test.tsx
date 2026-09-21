import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import {
  registerRequest,
  resendVerificationRequest,
  verifyEmailRequest,
} from '@/auth/auth-api';
import { removeAccessToken, saveAccessToken } from '@/auth/auth-storage';

jest.mock('@/auth/auth-storage', () => ({
  getAccessToken: jest.fn().mockResolvedValue(null),
  saveAccessToken: jest.fn(),
  removeAccessToken: jest.fn(),
}));

jest.mock('@/auth/auth-api', () => ({
  getCurrentUser: jest.fn(),
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  verifyEmailRequest: jest.fn(),
  resendVerificationRequest: jest.fn(),
  socialAuthRequest: jest.fn(),
}));

jest.mock('@/auth/social-auth-service', () => ({
  requestSocialIdentityToken: jest.fn(),
}));

jest.mock('@/api/client', () => ({
  api: {
    setTokenGetter: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn().mockResolvedValue('unavailable'),
  resetPushPermissionRequestState: jest.fn(),
  unregisterKnownPushDeviceAsync: jest.fn(),
}));

jest.mock('@/perf/home-cold-start-trace', () => ({
  markHomePerfEvent: jest.fn(),
}));

function AuthActionsProbe() {
  const auth = useAuth();

  return (
    <>
      <Text testID="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</Text>
      <Pressable
        testID="register"
        onPress={() => {
          void auth.register('user@example.com', 'Password123!', 'User');
        }}
      />
      <Pressable
        testID="verify"
        onPress={() => {
          void auth.verifyEmail('token-value');
        }}
      />
      <Pressable
        testID="resend"
        onPress={() => {
          void auth.resendVerification('user@example.com');
        }}
      />
    </>
  );
}

describe('AuthProvider verification flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not establish a session after register', async () => {
    (registerRequest as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
      requiresEmailVerification: true,
      message: 'Check your email.',
    });

    const screen = render(
      <AuthProvider>
        <AuthActionsProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('no');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('register'));
    });

    expect(registerRequest).toHaveBeenCalled();
    expect(removeAccessToken).toHaveBeenCalled();
    expect(saveAccessToken).not.toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').props.children).toBe('no');
  });

  it('establishes a session after verifyEmail', async () => {
    (verifyEmailRequest as jest.Mock).mockResolvedValue({
      accessToken: 'verified-token',
      expiresAt: '2026-01-01T00:00:00Z',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'User',
        createdAt: '2026-01-01T00:00:00Z',
      },
    });

    const screen = render(
      <AuthProvider>
        <AuthActionsProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('verify'));
    });

    await waitFor(() => {
      expect(verifyEmailRequest).toHaveBeenCalledWith({ token: 'token-value' });
      expect(saveAccessToken).toHaveBeenCalledWith('verified-token');
    });
  });

  it('calls resend verification endpoint', async () => {
    (resendVerificationRequest as jest.Mock).mockResolvedValue({
      message: 'If an account exists, you will receive a verification email.',
    });

    const screen = render(
      <AuthProvider>
        <AuthActionsProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('resend'));
    });

    expect(resendVerificationRequest).toHaveBeenCalledWith({ email: 'user@example.com' });
  });
});
