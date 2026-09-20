import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { removeAccessToken } from '@/auth/auth-storage';
import {
  resetPushPermissionRequestState,
  unregisterKnownPushDeviceAsync,
} from '@/features/follows/services/push-device-service';

jest.mock('@/auth/auth-storage', () => ({
  getAccessToken: jest.fn().mockResolvedValue(null),
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
  ensurePushDeviceRegisteredAsync: jest.fn(),
  resetPushPermissionRequestState: jest.fn(),
  unregisterKnownPushDeviceAsync: jest.fn(),
}));

function LogoutProbe() {
  const auth = useAuth();

  return (
    <>
      <Text testID="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</Text>
      <Pressable testID="logout" onPress={() => void auth.logout()}>
        <Text>Logout</Text>
      </Pressable>
    </>
  );
}

describe('AuthProvider logout push lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unregisters push device and resets permission state before clearing the session', async () => {
    let unregisterResolved = false;
    (unregisterKnownPushDeviceAsync as jest.Mock).mockImplementation(async () => {
      unregisterResolved = true;
    });
    (removeAccessToken as jest.Mock).mockImplementation(async () => {
      expect(unregisterResolved).toBe(true);
    });

    const screen = render(
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').props.children).toBe('no');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('logout'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(unregisterKnownPushDeviceAsync).toHaveBeenCalled();
      expect(resetPushPermissionRequestState).toHaveBeenCalled();
      expect(removeAccessToken).toHaveBeenCalled();
    });
  });
});
