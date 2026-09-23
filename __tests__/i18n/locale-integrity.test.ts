import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { tr } from '@/i18n/locales/tr';
import { SUPPORTED_UI_LOCALES, getSupportedUiLocale } from '@/i18n/supported-locales';
import { toFormatLocaleTag, normalizeDeviceLanguageCode } from '@/i18n/locale-tags';
import type { UiLanguage } from '@/i18n/types';

type TranslationTree = Record<string, unknown>;

function collectLeafPaths(
  node: unknown,
  prefix = '',
  paths = new Map<string, string>(),
): Map<string, string> {
  if (typeof node === 'string') {
    paths.set(prefix, node);
    return paths;
  }

  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [key, value] of Object.entries(node as TranslationTree)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      collectLeafPaths(value, nextPrefix, paths);
    }
  }

  return paths;
}

function extractPlaceholders(value: string): string[] {
  const matches = value.match(/\{\{[^}]+\}\}/g);
  return matches ? [...matches].sort() : [];
}

describe('locale integrity', () => {
  const englishPaths = collectLeafPaths(en);
  const turkishPaths = collectLeafPaths(tr);
  const spanishPaths = collectLeafPaths(es);

  it('keeps EN/TR/ES key parity', () => {
    expect([...turkishPaths.keys()].sort()).toEqual([...englishPaths.keys()].sort());
    expect([...spanishPaths.keys()].sort()).toEqual([...englishPaths.keys()].sort());
  });

  it('preserves interpolation placeholders against canonical EN', () => {
    for (const [path, englishValue] of englishPaths.entries()) {
      const englishPlaceholders = extractPlaceholders(englishValue);
      if (englishPlaceholders.length === 0) {
        continue;
      }

      expect(extractPlaceholders(turkishPaths.get(path)!)).toEqual(englishPlaceholders);
      expect(extractPlaceholders(spanishPaths.get(path)!)).toEqual(englishPlaceholders);
    }
  });

  it('maps supported UI locales to expected format tags', () => {
    const mappings: Record<UiLanguage, string> = {
      en: 'en-US',
      tr: 'tr-TR',
      es: 'es-ES',
    };

    for (const locale of SUPPORTED_UI_LOCALES) {
      expect(getSupportedUiLocale(locale.code).formatTag).toBe(mappings[locale.code]);
      expect(toFormatLocaleTag(locale.code)).toBe(mappings[locale.code]);
    }
  });

  it('resolves device Spanish and unsupported fallback', () => {
    expect(normalizeDeviceLanguageCode('es-ES')).toBe('es');
    expect(normalizeDeviceLanguageCode('es-MX')).toBe('es');
    expect(normalizeDeviceLanguageCode('de-DE')).toBe('en');
  });
});
