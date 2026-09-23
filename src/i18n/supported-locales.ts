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
      de: 'Englisch',
      fr: 'Anglais',
      it: 'Inglese',
      pt: 'Inglês',
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
      de: 'Türkisch',
      fr: 'Turc',
      it: 'Turco',
      pt: 'Turco',
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
      de: 'Spanisch',
      fr: 'Espagnol',
      it: 'Spagnolo',
      pt: 'Espanhol',
    },
  },
  {
    code: 'de',
    formatTag: 'de-DE',
    countryCode: 'DE',
    labels: {
      en: 'German',
      tr: 'Almanca',
      es: 'Alemán',
      de: 'Deutsch',
      fr: 'Allemand',
      it: 'Tedesco',
      pt: 'Alemão',
    },
  },
  {
    code: 'fr',
    formatTag: 'fr-FR',
    countryCode: 'FR',
    labels: {
      en: 'French',
      tr: 'Fransızca',
      es: 'Francés',
      de: 'Französisch',
      fr: 'Français',
      it: 'Francese',
      pt: 'Francês',
    },
  },
  {
    code: 'it',
    formatTag: 'it-IT',
    countryCode: 'IT',
    labels: {
      en: 'Italian',
      tr: 'İtalyanca',
      es: 'Italiano',
      de: 'Italienisch',
      fr: 'Italien',
      it: 'Italiano',
      pt: 'Italiano',
    },
  },
  {
    code: 'pt',
    formatTag: 'pt-BR',
    countryCode: 'BR',
    labels: {
      en: 'Portuguese (Brazil)',
      tr: 'Brezilya Portekizcesi',
      es: 'Portugués (Brasil)',
      de: 'Portugiesisch (Brasil)',
      fr: 'Portugais (Brésil)',
      it: 'Portoghese (Brasile)',
      pt: 'Português (Brasil)',
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
  return (
    value === 'en' ||
    value === 'tr' ||
    value === 'es' ||
    value === 'de' ||
    value === 'fr' ||
    value === 'it' ||
    value === 'pt'
  );
}
