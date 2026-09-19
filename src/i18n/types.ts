export type UiLanguage = 'en' | 'tr';

export type LocalePreferenceSource = 'saved' | 'device' | 'fallback';

export const SUPPORTED_UI_LANGUAGES: readonly UiLanguage[] = ['en', 'tr'];

export const UI_LANGUAGE_STORAGE_KEY = 'movieapp.ui_language';
