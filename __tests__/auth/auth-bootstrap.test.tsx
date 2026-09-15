import { act, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { getAccessToken } from '@/auth/auth-storage';
import { getCurrentUser } from '@/auth/auth-api';
import { ApiError } from '@/api/errors';

jest.mock('@/auth/auth-storage', () => ({
  getAccessToken: jest.fn(),
  saveAccessToken: jest.fn(),
  removeAccessToken: jest.fn(),
}));

jest.mock('@/auth/auth-api', () => ({
  getCurrentUser: jest.fn(),
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
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
  resetPushPermissionRequestState: jest.fn(),
  unregisterKnownPushDeviceAsync: jest.fn(),
}));

function AuthProbe() {
  const auth = useAuth();

  return (
    <>
      <Text testID="loading">{auth.isLoading ? 'loading' : 'ready'}</Text>
      <Text testID="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</Text>
      <Text testID="user">{auth.user?.displayName ?? 'none'}</Text>
    </>
  );
}

describe('AuthProvider bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unblocks startup before /api/auth/me resolves and hydrates user afterward', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('stored-token');
    let resolveMe: ((value: { displayName: string }) => void) | undefined;
    (getCurrentUser as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMe = resolve;
        }),
    );

    const screen = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('ready');
    });

    expect(screen.getByTestId('authenticated').props.children).toBe('yes');
    expect(screen.getByTestId('user').props.children).toBe('none');
    expect(getCurrentUser).toHaveBeenCalled();

    await act(async () => {
      resolveMe?.({ displayName: 'Emre' });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').props.children).toBe('Emre');
    });
  });

  it('clears the session when /api/auth/me returns unauthorized', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('expired-token');
    (getCurrentUser as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'unauthorized',
        status: 401,
        userMessage: 'Session expired.',
      }),
    );

    const screen = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('ready');
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('no');
      expect(screen.getByTestId('user').props.children).toBe('none');
    });
  });

  it('keeps a stored token when /api/auth/me fails for non-auth reasons', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('stored-token');
    (getCurrentUser as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'server',
        status: 503,
        userMessage: 'Service unavailable.',
      }),
    );

    const screen = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('ready');
      expect(screen.getByTestId('authenticated').props.children).toBe('yes');
      expect(screen.getByTestId('user').props.children).toBe('none');
    });
  });
});
