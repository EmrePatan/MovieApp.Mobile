import { resolveInitialUiLanguage } from '@/features/locale/resolve-ui-locale';
import { changeUiLanguage, i18n } from '@/i18n';
import { validateLoginForm } from '@/utils/validation';

describe('resolveInitialUiLanguage', () => {
  it('uses saved language when present', () => {
    expect(resolveInitialUiLanguage('tr', 'en')).toEqual({
      language: 'tr',
      source: 'saved',
    });
  });

  it('maps Turkish device locale to tr', () => {
    expect(resolveInitialUiLanguage(null, 'tr')).toEqual({
      language: 'tr',
      source: 'device',
    });
  });

  it('falls back to English for unsupported device locales', () => {
    expect(resolveInitialUiLanguage(null, 'de')).toEqual({
      language: 'en',
      source: 'device',
    });
  });

  it('falls back to English when device locale is unavailable', () => {
    expect(resolveInitialUiLanguage(null, null)).toEqual({
      language: 'en',
      source: 'fallback',
    });
  });
});

describe('i18n language switching', () => {
  beforeEach(async () => {
    await changeUiLanguage('en');
  });

  it('updates validation messages immediately when language changes', async () => {
    expect(validateLoginForm('', '').email).toBe('Email is required.');

    await changeUiLanguage('tr');

    expect(validateLoginForm('', '').email).toBe('E-posta gerekli.');
    expect(i18n.language).toBe('tr');
  });
});
