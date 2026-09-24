import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { removeAccessToken } from '@/auth/auth-storage';
import { api } from '@/api/client';
import { clearUserQueryCache } from '@/features/profile/utils/clear-user-query-cache';
import {
  forgetKnownPushDeviceAsync,
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

jest.mock('@/features/profile/utils/clear-user-query-cache', () => ({
  clearUserQueryCache: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn(),
  forgetKnownPushDeviceAsync: jest.fn(),
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
      <Pressable testID="complete-deletion" onPress={() => void auth.completeAccountDeletion()}>
        <Text>Complete deletion</Text>
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

  it('forgets the push device locally without a revoked-token unregister after account deletion', async () => {
    let forgetResolved = false;
    (forgetKnownPushDeviceAsync as jest.Mock).mockImplementation(async () => {
      forgetResolved = true;
    });
    (removeAccessToken as jest.Mock).mockImplementation(async () => {
      expect(forgetResolved).toBe(true);
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
      fireEvent.press(screen.getByTestId('complete-deletion'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(forgetKnownPushDeviceAsync).toHaveBeenCalledTimes(1);
      expect(resetPushPermissionRequestState).toHaveBeenCalled();
      expect(removeAccessToken).toHaveBeenCalled();
    });
    expect(unregisterKnownPushDeviceAsync).not.toHaveBeenCalled();
    expect(clearUserQueryCache).toHaveBeenCalled();
  });

  it('clears user query caches when the session ends through the unauthorized handler', async () => {
    render(
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>,
    );

    const handler = (api.setUnauthorizedHandler as jest.Mock).mock.calls.at(-1)?.[0] as
      | (() => Promise<void>)
      | undefined;
    expect(handler).toBeDefined();

    await act(async () => {
      await handler?.();
    });

    expect(clearUserQueryCache).toHaveBeenCalled();
    expect(removeAccessToken).toHaveBeenCalled();
  });
});
