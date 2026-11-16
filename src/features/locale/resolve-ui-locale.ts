import * as Localization from 'expo-localization';
import { normalizeDeviceLanguageCode } from '@/i18n/locale-tags';
import type { LocalePreferenceSource, UiLanguage } from '@/i18n/types';

export function resolveInitialUiLanguage(
  savedLanguage: UiLanguage | null,
  deviceLanguageCode?: string | null,
): { language: UiLanguage; source: LocalePreferenceSource } {
  if (savedLanguage) {
    return { language: savedLanguage, source: 'saved' };
  }

  const resolvedDeviceCode =
    deviceLanguageCode !== undefined ? deviceLanguageCode : getDeviceLanguageCode();
  if (resolvedDeviceCode?.trim()) {
    return {
      language: normalizeDeviceLanguageCode(resolvedDeviceCode),
      source: 'device',
    };
  }

  return { language: 'en', source: 'fallback' };
}

export function getDeviceLanguageCode(): string | null {
  const primary = Localization.getLocales()[0];
  return primary?.languageCode ?? null;
}
