import type { ExpoConfig } from 'expo/config';

const VERSION = '1.0.0';

const config: ExpoConfig = {
  name: 'MovieApp',
  slug: 'movieapp-mobile',
  version: VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'movieapp',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0F',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.movieapp.mobile',
    buildNumber: '1',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0A0A0F',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.movieapp.mobile',
    versionCode: 1,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-secure-store'],
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    router: {
      origin: false,
    },
  },
} as ExpoConfig;

export default config;
