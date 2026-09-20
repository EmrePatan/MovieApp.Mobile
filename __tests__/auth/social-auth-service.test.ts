jest.unmock('@/auth/social-auth-service');

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: jest.fn(() => null),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  TurboModuleRegistry: {
    get: jest.fn(() => ({})),
  },
}));

import { prepareGoogleSignInForAccountSelection } from '@/auth/social-auth-service';

describe('prepareGoogleSignInForAccountSelection', () => {
  const hasPlayServices = jest.fn().mockResolvedValue(true);
  const signOut = jest.fn().mockResolvedValue(null);

  beforeEach(() => {
    jest.clearAllMocks();
    hasPlayServices.mockResolvedValue(true);
    signOut.mockResolvedValue(null);
  });

  it('clears the cached Google account on Android before sign-in', async () => {
    await prepareGoogleSignInForAccountSelection('android', {
      hasPlayServices,
      signOut,
      signIn: jest.fn(),
    });

    expect(hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(hasPlayServices.mock.invocationCallOrder[0]).toBeLessThan(
      signOut.mock.invocationCallOrder[0],
    );
  });

  it('does not clear the cached Google account on iOS', async () => {
    await prepareGoogleSignInForAccountSelection('ios', {
      hasPlayServices,
      signOut,
      signIn: jest.fn(),
    });

    expect(hasPlayServices).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('still allows sign-in when clearing the cached Google account fails', async () => {
    signOut.mockRejectedValueOnce(new Error('sign-out failed'));

    await expect(
      prepareGoogleSignInForAccountSelection('android', {
        hasPlayServices,
        signOut,
        signIn: jest.fn(),
      }),
    ).resolves.toBeUndefined();
  });
});
