import { Platform } from 'react-native';
import type { RemoteAppConfig } from './types';

const IOS_STORE_FALLBACK = 'https://apps.apple.com/app/id6814454427';
const ANDROID_STORE_FALLBACK =
  'https://play.google.com/store/apps/details?id=com.movieapp.mobile';

export function getDefaultStoreUrlForPlatform(): string {
  return Platform.OS === 'ios' ? IOS_STORE_FALLBACK : ANDROID_STORE_FALLBACK;
}

export function resolveStoreUrlForPlatform(config: RemoteAppConfig): string {
  const platformConfig =
    Platform.OS === 'ios' ? config.versions.ios : config.versions.android;
  const candidate = platformConfig.storeUrl?.trim();

  if (candidate && /^https:\/\//i.test(candidate)) {
    return candidate;
  }

  return getDefaultStoreUrlForPlatform();
}
