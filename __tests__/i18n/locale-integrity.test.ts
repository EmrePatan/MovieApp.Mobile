import { de } from '@/i18n/locales/de';
import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { fr } from '@/i18n/locales/fr';
import { it as itLocale } from '@/i18n/locales/it';
import { pt } from '@/i18n/locales/pt';
import { tr } from '@/i18n/locales/tr';
import { SUPPORTED_UI_LOCALES, getSupportedUiLocale } from '@/i18n/supported-locales';
import { toFormatLocaleTag, normalizeDeviceLanguageCode } from '@/i18n/locale-tags';
import { SUPPORTED_UI_LANGUAGES, type UiLanguage } from '@/i18n/types';

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
  const localeTrees: Record<UiLanguage, Map<string, string>> = {
    en: englishPaths,
    tr: collectLeafPaths(tr),
    es: collectLeafPaths(es),
    de: collectLeafPaths(de),
    fr: collectLeafPaths(fr),
    it: collectLeafPaths(itLocale),
    pt: collectLeafPaths(pt),
  };

  it('registers all seven supported UI locales', () => {
    expect(SUPPORTED_UI_LANGUAGES).toEqual(['en', 'tr', 'es', 'de', 'fr', 'it', 'pt']);
    expect(SUPPORTED_UI_LOCALES).toHaveLength(7);
  });

  it('keeps key parity across all locale resources', () => {
    const englishKeys = [...englishPaths.keys()].sort();

    for (const language of SUPPORTED_UI_LANGUAGES) {
      if (language === 'en') {
        continue;
      }

      expect([...localeTrees[language].keys()].sort()).toEqual(englishKeys);
    }
  });

  it('preserves interpolation placeholders against canonical EN', () => {
    for (const [path, englishValue] of englishPaths.entries()) {
      const englishPlaceholders = extractPlaceholders(englishValue);
      if (englishPlaceholders.length === 0) {
        continue;
      }

      for (const language of SUPPORTED_UI_LANGUAGES) {
        if (language === 'en') {
          continue;
        }

        expect(extractPlaceholders(localeTrees[language].get(path)!)).toEqual(englishPlaceholders);
      }
    }
  });

  it('maps supported UI locales to expected format tags', () => {
    const mappings: Record<UiLanguage, string> = {
      en: 'en-US',
      tr: 'tr-TR',
      es: 'es-ES',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
      pt: 'pt-BR',
    };

    for (const locale of SUPPORTED_UI_LOCALES) {
      expect(getSupportedUiLocale(locale.code).formatTag).toBe(mappings[locale.code]);
      expect(toFormatLocaleTag(locale.code)).toBe(mappings[locale.code]);
    }
  });

  it('resolves device locales and unsupported fallback', () => {
    expect(normalizeDeviceLanguageCode('es-ES')).toBe('es');
    expect(normalizeDeviceLanguageCode('es-MX')).toBe('es');
    expect(normalizeDeviceLanguageCode('de-DE')).toBe('de');
    expect(normalizeDeviceLanguageCode('fr-FR')).toBe('fr');
    expect(normalizeDeviceLanguageCode('it-IT')).toBe('it');
    expect(normalizeDeviceLanguageCode('pt-BR')).toBe('pt');
    expect(normalizeDeviceLanguageCode('pt-PT')).toBe('pt');
    expect(normalizeDeviceLanguageCode('ja-JP')).toBe('en');
  });
});
