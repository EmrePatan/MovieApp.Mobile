jest.unmock('@/auth/social-auth-service');

const mockDismiss = jest.fn();
const mockSignInAsync = jest.fn();

jest.mock('react-native', () => ({
  Keyboard: {
    dismiss: (...args: unknown[]) => mockDismiss(...args),
  },
  Platform: { OS: 'ios' },
  TurboModuleRegistry: {
    get: jest.fn(() => null),
  },
}));

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: jest.fn(() => ({})),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  signInAsync: (...args: unknown[]) => mockSignInAsync(...args),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

import { requestSocialIdentityToken } from '@/auth/social-auth-service';

describe('requestSocialIdentityToken apple keyboard lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInAsync.mockResolvedValue({ identityToken: 'apple-token' });
  });

  it('dismisses the keyboard before launching Apple sign-in', async () => {
    await requestSocialIdentityToken('apple');

    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(mockSignInAsync).toHaveBeenCalledTimes(1);
    expect(mockDismiss.mock.invocationCallOrder[0]).toBeLessThan(
      mockSignInAsync.mock.invocationCallOrder[0],
    );
  });
});
