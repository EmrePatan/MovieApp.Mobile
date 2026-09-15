import * as SecureStore from 'expo-secure-store';
import { normalizeRegionCode } from './region-options';

const USER_REGION_KEY = 'movieapp.user_region';

export async function getSavedUserRegion(): Promise<string | null> {
  const saved = await SecureStore.getItemAsync(USER_REGION_KEY);
  if (!saved) {
    return null;
  }

  const normalized = saved.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export async function saveUserRegion(regionCode: string): Promise<void> {
  await SecureStore.setItemAsync(USER_REGION_KEY, normalizeRegionCode(regionCode));
}

export async function clearSavedUserRegion(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_REGION_KEY);
}
