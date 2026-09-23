import { i18n } from '@/i18n';
import type { UiLanguage } from '@/i18n/types';

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export async function initI18nForTests(language: UiLanguage = 'en'): Promise<void> {
  await i18n.changeLanguage(language);
}
