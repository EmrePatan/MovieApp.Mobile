import { Platform } from 'react-native';
import Constants from 'expo-constants';

function readExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return extra?.[key]?.trim() || undefined;
}

/** Giphy search API key (platform-specific SDK keys or fallback). */
export function getGiphyApiKey(): string {
  const shared = process.env.EXPO_PUBLIC_GIPHY_API_KEY?.trim();
  if (shared) return shared;

  const android =
    process.env.EXPO_PUBLIC_GIPHY_API_KEY_ANDROID?.trim() ??
    readExtra('giphyApiKeyAndroid');
  const ios =
    process.env.EXPO_PUBLIC_GIPHY_API_KEY_IOS?.trim() ?? readExtra('giphyApiKeyIos');

  if (Platform.OS === 'android' && android) return android;
  if (Platform.OS === 'ios' && ios) return ios;
  return android ?? ios ?? '';
}