import type { UiLanguage } from './types';

export interface SupportedUiLocale {
  code: UiLanguage;
  formatTag: string;
  countryCode: string;
  labels: Record<UiLanguage, string>;
}

export const SUPPORTED_UI_LOCALES: readonly SupportedUiLocale[] = [
  {
    code: 'en',
    formatTag: 'en-US',
    countryCode: 'US',
    labels: {
      en: 'English',
      tr: 'İngilizce',
      es: 'Inglés',
    },
  },
  {
    code: 'tr',
    formatTag: 'tr-TR',
    countryCode: 'TR',
    labels: {
      en: 'Turkish',
      tr: 'Türkçe',
      es: 'Turco',
    },
  },
  {
    code: 'es',
    formatTag: 'es-ES',
    countryCode: 'ES',
    labels: {
      en: 'Spanish',
      tr: 'İspanyolca',
      es: 'Español',
    },
  },
];

const localeByCode = new Map(SUPPORTED_UI_LOCALES.map((locale) => [locale.code, locale]));

export function getSupportedUiLocale(language: UiLanguage): SupportedUiLocale {
  const locale = localeByCode.get(language);
  if (!locale) {
    return localeByCode.get('en')!;
  }

  return locale;
}

export function isSupportedUiLanguage(value: string | null | undefined): value is UiLanguage {
  return value === 'en' || value === 'tr' || value === 'es';
}
