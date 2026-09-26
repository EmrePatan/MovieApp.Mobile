import { api } from '@/api/client';
import { toFormatLocaleTag } from '@/i18n/locale-tags';
import type { UiLanguage } from '@/i18n/types';

export function detailQueryLocaleTagFromLanguage(language: UiLanguage): string {
  return toFormatLocaleTag(language);
}

export function resolveDetailQueryLocaleTag(): string {
  return api.getAcceptLanguageTag() ?? toFormatLocaleTag('en');
}
