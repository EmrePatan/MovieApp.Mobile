import {
  getLanguageCountryCode,
  getLanguageFlagEmoji,
  getLanguageLabel,
} from '@/i18n/locale-tags';

describe('locale tags', () => {
  it('maps supported languages to country flags', () => {
    expect(getLanguageCountryCode('en')).toBe('US');
    expect(getLanguageCountryCode('tr')).toBe('TR');
    expect(getLanguageCountryCode('es')).toBe('ES');
    expect(getLanguageFlagEmoji('en')).toBe('🇺🇸');
    expect(getLanguageFlagEmoji('tr')).toBe('🇹🇷');
    expect(getLanguageFlagEmoji('es')).toBe('🇪🇸');
  });

  it('keeps language labels localized', () => {
    expect(getLanguageLabel('tr', 'en')).toBe('Turkish');
    expect(getLanguageLabel('tr', 'tr')).toBe('Türkçe');
    expect(getLanguageLabel('es', 'en')).toBe('Spanish');
    expect(getLanguageLabel('es', 'es')).toBe('Español');
  });
});
