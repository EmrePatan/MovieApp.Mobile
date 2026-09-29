import { en } from '@/i18n/locales/en';
import { tr } from '@/i18n/locales/tr';
import { de } from '@/i18n/locales/de';
import { es } from '@/i18n/locales/es';
import { fr } from '@/i18n/locales/fr';
import { it } from '@/i18n/locales/it';
import { pt } from '@/i18n/locales/pt';

const credentialProfileKeys = [
  'signInSecurityTitle',
  'signInSecuritySubtitle',
  'signInMethods',
  'passwordStatusSet',
  'passwordSet',
  'passwordNotSet',
  'createPassword',
  'createPasswordHint',
  'providerConnected',
  'providerNotConnected',
  'connectProvider',
  'disconnectProvider',
  'linkProviderTitle',
  'linkProviderPasswordHint',
  'unlinkProviderTitle',
  'cannotRemoveLastSignInMethod',
  'emailChangeSocialReauthHint',
  'emailChangeReauthRequired',
] as const;

const locales: Array<[string, typeof en]> = [
  ['en', en],
  ['tr', tr],
  ['de', de],
  ['es', es],
  ['fr', fr],
  ['it', it],
  ['pt', pt],
];

describe('credential localization', () => {
  test('all locales define credential profile strings', () => {
    for (const [code, locale] of locales) {
      for (const key of credentialProfileKeys) {
        const value = locale.profile[key];
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        if (code !== 'en') {
          expect(value).not.toBe(en.profile[key]);
        }
      }
    }
  });

  test('all locales define account collision copy', () => {
    for (const [code, locale] of locales) {
      const value = locale.errors.authAccountExistsDifferentSignInMethod;
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      if (code !== 'en') {
        expect(value).not.toBe(en.errors.authAccountExistsDifferentSignInMethod);
      }
    }
  });
});
