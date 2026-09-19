jest.mock('@/auth/social-auth-service', () => ({
  requestSocialIdentityToken: jest.fn(),
  SocialAuthCancelledError: class SocialAuthCancelledError extends Error {},
  SocialAuthConfigurationError: class SocialAuthConfigurationError extends Error {},
  formatGoogleSignInDevelopmentErrorMessage: jest.fn((error: unknown) => String(error)),
  isGoogleSocialAuthDebugDiagnosticsEnabled: jest.fn(() => false),
}));

jest.mock('expo-apple-authentication', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    signInAsync: jest.fn(),
    AppleAuthenticationButton: ({
      onPress,
    }: {
      onPress: () => void;
    }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'Continue with Apple', onPress },
        React.createElement(Text, null, 'Continue with Apple'),
      ),
    AppleAuthenticationButtonType: { CONTINUE: 0 },
    AppleAuthenticationButtonStyle: { WHITE: 0 },
    AppleAuthenticationScope: {
      FULL_NAME: 0,
      EMAIL: 1,
    },
  };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
  },
  isCancelledResponse: jest.fn(() => false),
  isErrorWithCode: jest.fn(() => false),
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
}));

jest.mock('@/features/locale/hooks/useLocalePreference', () => ({
  useLocalePreference: jest.fn(() => ({
    language: 'en',
    source: 'fallback',
    isHydrated: true,
    setLanguage: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

beforeAll(async () => {
  const { ensureI18nInitialized } = require('@/i18n') as typeof import('@/i18n');
  await ensureI18nInitialized('en');
});

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useNavigation: jest.fn(() => ({ setOptions: jest.fn() })),
  useFocusEffect: jest.fn((callback: () => void | (() => void)) => {
    callback();
    return undefined;
  }),
  useSegments: jest.fn(() => []),
  Redirect: 'Redirect',
  Stack: 'Stack',
  Tabs: 'Tabs',
  Link: 'Link',
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn().mockResolvedValue('unavailable'),
  unregisterKnownPushDeviceAsync: jest.fn().mockResolvedValue(undefined),
  resetPushPermissionRequestState: jest.fn(),
  getLastRegisteredExpoPushToken: jest.fn().mockReturnValue(null),
}));

jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: jest.fn((callback: () => void | (() => void)) => {
      callback();
      return undefined;
    }),
  };
});

export {};
