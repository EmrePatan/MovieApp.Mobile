import {
  getLanguageCountryCode,
  getLanguageFlagEmoji,
  getLanguageLabel,
  normalizeDeviceLanguageCode,
} from '@/i18n/locale-tags';

describe('locale tags', () => {
  it('maps supported languages to country flags', () => {
    expect(getLanguageCountryCode('en')).toBe('US');
    expect(getLanguageCountryCode('tr')).toBe('TR');
    expect(getLanguageCountryCode('es')).toBe('ES');
    expect(getLanguageCountryCode('de')).toBe('DE');
    expect(getLanguageCountryCode('fr')).toBe('FR');
    expect(getLanguageCountryCode('it')).toBe('IT');
    expect(getLanguageCountryCode('pt')).toBe('BR');
    expect(getLanguageFlagEmoji('en')).toBe('🇺🇸');
    expect(getLanguageFlagEmoji('de')).toBe('🇩🇪');
    expect(getLanguageFlagEmoji('pt')).toBe('🇧🇷');
  });

  it('keeps language labels localized', () => {
    expect(getLanguageLabel('tr', 'en')).toBe('Turkish');
    expect(getLanguageLabel('tr', 'tr')).toBe('Türkçe');
    expect(getLanguageLabel('es', 'en')).toBe('Spanish');
    expect(getLanguageLabel('de', 'de')).toBe('Deutsch');
    expect(getLanguageLabel('pt', 'pt')).toBe('Português (Brasil)');
  });

  it('maps device language codes for all supported locales', () => {
    expect(normalizeDeviceLanguageCode('de-DE')).toBe('de');
    expect(normalizeDeviceLanguageCode('fr-FR')).toBe('fr');
    expect(normalizeDeviceLanguageCode('pt-BR')).toBe('pt');
  });
});
