import { getSupportedUiLocale } from '@/i18n/supported-locales';
import type { UiLanguage } from '@/i18n/types';

export function resolveContentLocaleFromUiLanguage(language: UiLanguage): string {
  return getSupportedUiLocale(language).formatTag;
}

export function normalizeContentLocale(locale: string | null | undefined): string | null {
  if (!locale) {
    return null;
  }

  const trimmed = locale.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (lower === 'en' || lower === 'en-us') {
    return 'en-US';
  }

  if (lower === 'tr' || lower === 'tr-tr') {
    return 'tr-TR';
  }

  if (lower === 'es' || lower === 'es-es') {
    return 'es-ES';
  }

  if (lower === 'de' || lower === 'de-de') {
    return 'de-DE';
  }

  if (lower === 'fr' || lower === 'fr-fr') {
    return 'fr-FR';
  }

  if (lower === 'it' || lower === 'it-it') {
    return 'it-IT';
  }

  if (lower === 'pt' || lower === 'pt-br') {
    return 'pt-BR';
  }

  return trimmed;
}

function contentLanguageKey(locale: string): string {
  const primary = locale.split(/[-_]/)[0]?.trim().toLowerCase();
  return primary || locale.toLowerCase();
}

/**
 * Show "See translation" only when we know the authoring language and it differs
 * from the viewer's UI language. Missing locale → hide (avoid false positives
 * on same-language content that never stored authoringLocale).
 */
export function shouldShowReviewTranslationAction(
  authoringLocale: string | null | undefined,
  currentContentLocale: string,
): boolean {
  const normalizedAuthoring = normalizeContentLocale(authoringLocale);
  const normalizedCurrent = normalizeContentLocale(currentContentLocale);

  if (!normalizedAuthoring || !normalizedCurrent) {
    return false;
  }

  return contentLanguageKey(normalizedAuthoring) !== contentLanguageKey(normalizedCurrent);
}
