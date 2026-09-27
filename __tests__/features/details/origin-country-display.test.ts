import { resolveOriginCountries } from '@/features/details/shared/utils/origin-country-display';

describe('resolveOriginCountries', () => {
  it('returns at most two unique valid codes', () => {
    const result = resolveOriginCountries(['TR', 'US', 'FR', 'tr']);

    expect(result.map((entry) => entry.code)).toEqual(['TR', 'US']);
  });

  it('returns empty for invalid input', () => {
    expect(resolveOriginCountries(null)).toEqual([]);
    expect(resolveOriginCountries(['', 'USA'])).toEqual([]);
  });
});
