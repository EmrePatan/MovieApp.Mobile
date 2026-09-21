import { i18n } from '@/i18n';

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export async function initI18nForTests(language: 'en' | 'tr' = 'en'): Promise<void> {
  await i18n.changeLanguage(language);
}
