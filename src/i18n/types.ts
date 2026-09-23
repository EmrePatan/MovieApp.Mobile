export type UiLanguage = 'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'pt';

export type LocalePreferenceSource = 'saved' | 'device' | 'fallback';

export const SUPPORTED_UI_LANGUAGES: readonly UiLanguage[] = [
  'en',
  'tr',
  'es',
  'de',
  'fr',
  'it',
  'pt',
];

export const UI_LANGUAGE_STORAGE_KEY = 'movieapp.ui_language';
