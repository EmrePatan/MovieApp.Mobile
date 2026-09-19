import type { UiLanguage } from './types';

export function toFormatLocaleTag(language: UiLanguage): string {
  return language === 'tr' ? 'tr-TR' : 'en-US';
}

export function normalizeDeviceLanguageCode(languageCode: string | null | undefined): UiLanguage {
  const normalized = languageCode?.trim().toLowerCase() ?? '';
  if (normalized.startsWith('tr')) {
    return 'tr';
  }

  return 'en';
}

export function getLanguageLabel(language: UiLanguage, inLanguage?: UiLanguage): string {
  const viewer = inLanguage ?? language;

  if (viewer === 'tr') {
    return language === 'tr' ? 'Türkçe' : 'İngilizce';
  }

  return language === 'tr' ? 'Turkish' : 'English';
}
