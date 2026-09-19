import * as SecureStore from 'expo-secure-store';
import type { UiLanguage } from '@/i18n/types';
import { UI_LANGUAGE_STORAGE_KEY, SUPPORTED_UI_LANGUAGES } from '@/i18n/types';

function normalizeUiLanguage(value: string | null | undefined): UiLanguage | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return SUPPORTED_UI_LANGUAGES.includes(normalized as UiLanguage)
    ? (normalized as UiLanguage)
    : null;
}

export async function getSavedUiLanguage(): Promise<UiLanguage | null> {
  const saved = await SecureStore.getItemAsync(UI_LANGUAGE_STORAGE_KEY);
  return normalizeUiLanguage(saved);
}

export async function saveUiLanguage(language: UiLanguage): Promise<void> {
  await SecureStore.setItemAsync(UI_LANGUAGE_STORAGE_KEY, language);
}

export async function clearSavedUiLanguage(): Promise<void> {
  await SecureStore.deleteItemAsync(UI_LANGUAGE_STORAGE_KEY);
}
