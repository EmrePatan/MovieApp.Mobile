import { countryCodeToFlagEmoji } from '@/features/discovery/utils/country-flag';

describe('country-flag', () => {
  it('converts ISO country codes to flag emoji', () => {
    expect(countryCodeToFlagEmoji('KR')).toBe('🇰🇷');
    expect(countryCodeToFlagEmoji('jp')).toBe('🇯🇵');
    expect(countryCodeToFlagEmoji(' FR ')).toBe('🇫🇷');
  });

  it('returns an empty string for invalid codes', () => {
    expect(countryCodeToFlagEmoji('KOR')).toBe('');
    expect(countryCodeToFlagEmoji('')).toBe('');
  });
});
