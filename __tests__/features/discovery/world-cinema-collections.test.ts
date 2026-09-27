import {
  DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
} from '@/features/discovery/world-cinema-types';
import {
  getOriginCountryLabel,
  getOriginCountryOptions,
  getWorldCinemaCollectionLabel,
  WORLD_CINEMA_CURATED_COLLECTIONS,
} from '@/features/discovery/world-cinema-collections';

const EXPECTED_CURATED_COUNTRIES = [
  'KR',
  'JP',
  'IR',
  'FR',
  'IT',
  'ES',
  'IN',
  'TR',
  'CN',
  'HK',
  'TW',
  'DE',
  'MX',
  'AR',
  'BR',
] as const;

describe('world-cinema-collections', () => {
  it('defines all 15 curated World Cinema countries', () => {
    expect(WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) => collection.originCountry)).toEqual(
      [...EXPECTED_CURATED_COUNTRIES],
    );
  });

  it('keeps South Korea as the default origin country', () => {
    expect(DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY).toBe('KR');
    expect(WORLD_CINEMA_CURATED_COLLECTIONS[0]?.originCountry).toBe('KR');
  });

  it('exposes IR, HK, TW, and AR in the full origin-country selector', () => {
    const optionCodes = getOriginCountryOptions().map((option) => option.code);

    expect(optionCodes).toEqual(expect.arrayContaining(['IR', 'HK', 'TW', 'AR']));
    expect(getOriginCountryLabel('IR')).toBe('Iran');
    expect(getOriginCountryLabel('HK')).toBe('Hong Kong');
    expect(getOriginCountryLabel('TW')).toBe('Taiwan');
    expect(getOriginCountryLabel('AR')).toBe('Argentina');
  });

  it('uses Türkiye for Turkey in curated country labels', () => {
    expect(getOriginCountryLabel('TR')).toBe('Türkiye');
  });

  it('localizes release-region origin countries via countryLabels', () => {
    expect(getOriginCountryLabel('US')).toBe('United States');
    expect(getOriginCountryLabel('GB')).toBe('United Kingdom');
    expect(getOriginCountryLabel('NL')).toBe('Netherlands');
    expect(getOriginCountryLabel('CA')).toBe('Canada');
    expect(getOriginCountryLabel('AU')).toBe('Australia');
  });

  it('uses country names for curated World Cinema hub chips', () => {
    expect(
      WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) =>
        getWorldCinemaCollectionLabel(collection.originCountry),
      ),
    ).toEqual(
      WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) =>
        getOriginCountryLabel(collection.originCountry),
      ),
    );
    expect(getWorldCinemaCollectionLabel('KR')).toBe('South Korea');
    expect(getWorldCinemaCollectionLabel('FR')).toBe('France');
    expect(getWorldCinemaCollectionLabel('TR')).toBe('Türkiye');
  });
});
