import { countryCodeToFlagEmoji } from '@/features/discovery/utils/country-flag';
import { getSupportedUiLocale, isSupportedUiLanguage } from './supported-locales';
import type { UiLanguage } from './types';

export function toFormatLocaleTag(language: UiLanguage): string {
  return getSupportedUiLocale(language).formatTag;
}

export function normalizeDeviceLanguageCode(languageCode: string | null | undefined): UiLanguage {
  const normalized = languageCode?.trim().toLowerCase() ?? '';
  if (normalized.startsWith('tr')) {
    return 'tr';
  }

  if (normalized.startsWith('es')) {
    return 'es';
  }

  if (normalized.startsWith('de')) {
    return 'de';
  }

  if (normalized.startsWith('fr')) {
    return 'fr';
  }

  if (normalized.startsWith('it')) {
    return 'it';
  }

  if (normalized.startsWith('pt')) {
    return 'pt';
  }

  return 'en';
}

export function getLanguageCountryCode(language: UiLanguage): string {
  return getSupportedUiLocale(language).countryCode;
}

export function getLanguageFlagEmoji(language: UiLanguage): string {
  return countryCodeToFlagEmoji(getLanguageCountryCode(language));
}

export function getLanguageLabel(language: UiLanguage, inLanguage?: UiLanguage): string {
  const viewer = inLanguage ?? language;
  return getSupportedUiLocale(language).labels[viewer];
}

export function normalizeUiLanguage(value: string | null | undefined): UiLanguage {
  if (isSupportedUiLanguage(value)) {
    return value;
  }

  return 'en';
}
