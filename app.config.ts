import type { ExpoConfig } from 'expo/config';

const VERSION = '1.0.0';

/** Keep in sync with config/app-identity.ts (validated by validate:production). */
const APP_IDENTITY = {
  androidPackage: 'com.movieapp.mobile',
  iosBundleIdentifier: 'com.movieapp.mobile',
  urlScheme: 'movieapp',
  easProjectId: '87854bea-c475-4d4d-85f2-dfc1ecb52997',
};

const config: ExpoConfig = {
  name: 'Movie Cave',
  slug: 'movieapp-mobile',
  version: VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: APP_IDENTITY.urlScheme,
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0F',
  },
  androidStatusBar: {
    backgroundColor: '#0A0A0F',
    barStyle: 'light-content',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: APP_IDENTITY.iosBundleIdentifier,
    buildNumber: '6',
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0D0D0C',
      foregroundImage: './assets/branding/adaptive-icon-foreground.png',
      monochromeImage: './assets/branding/monochrome-icon.png',
    },
    package: APP_IDENTITY.androidPackage,
    versionCode: 1,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'resize',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-notifications',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.673271760956-3j4poqn6jja3jabj19p6rv49h92iq0mt',
      },
    ],
    'expo-apple-authentication',
  ],
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    eas: {
    projectId:
      process.env.EAS_PROJECT_ID ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
      APP_IDENTITY.easProjectId,
  },
    router: {
      origin: false,
    },
  },
} as ExpoConfig;

export default config;
