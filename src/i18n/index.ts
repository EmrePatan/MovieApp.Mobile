import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { es } from './locales/es';
import { tr } from './locales/tr';
import { normalizeUiLanguage, toFormatLocaleTag } from './locale-tags';
import { SUPPORTED_UI_LANGUAGES } from './types';
import type { UiLanguage } from './types';

let initialized = false;

export async function ensureI18nInitialized(language: UiLanguage = 'en'): Promise<void> {
  if (!initialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        tr: { translation: tr },
        es: { translation: es },
      },
      lng: language,
      fallbackLng: 'en',
      supportedLngs: [...SUPPORTED_UI_LANGUAGES],
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
    initialized = true;
    return;
  }

  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }
}

export async function changeUiLanguage(language: UiLanguage): Promise<void> {
  await ensureI18nInitialized(language);
  await i18n.changeLanguage(language);
}

export function getCurrentUiLanguage(): UiLanguage {
  return normalizeUiLanguage(i18n.language);
}

export function getUiFormatLocaleTag(): string {
  return toFormatLocaleTag(getCurrentUiLanguage());
}

export { i18n };
