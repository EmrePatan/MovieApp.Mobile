import { de } from '@/i18n/locales/de';
import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { fr } from '@/i18n/locales/fr';
import { it as itLocale } from '@/i18n/locales/it';
import { pt } from '@/i18n/locales/pt';
import { tr } from '@/i18n/locales/tr';

const locales = { en, tr, de, es, fr, it: itLocale, pt };

const requiredPaths = [
  'appConfig.optionalUpdate.title',
  'appConfig.optionalUpdate.updateButton',
  'appConfig.optionalUpdate.updateButtonAccessibility',
  'appConfig.optionalUpdate.closeButtonAccessibility',
  'appConfig.forcedUpdate.title',
  'appConfig.forcedUpdate.body',
  'appConfig.forcedUpdate.updateButton',
  'appConfig.maintenance.title',
  'appConfig.maintenance.body',
  'appConfig.maintenance.retryButton',
] as const;

function readPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}

describe('appConfig locale integrity', () => {
  for (const [code, bundle] of Object.entries(locales)) {
    it(`includes required appConfig keys for ${code}`, () => {
      for (const path of requiredPaths) {
        const value = readPath(bundle as Record<string, unknown>, path);
        expect(typeof value).toBe('string');
        expect((value as string).trim().length).toBeGreaterThan(0);
      }
    });
  }
});
