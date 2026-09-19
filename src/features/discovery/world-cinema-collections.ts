import { REGION_OPTIONS } from '@/features/regions/region-options';
import {
  translateOriginCountryLabel,
  translateWorldCinemaCollection,
} from '@/i18n/catalog-labels';
import { countryCodeToFlagEmoji } from './utils/country-flag';
import type { WorldCinemaCollection } from './world-cinema-types';

export const WORLD_CINEMA_CURATED_COLLECTIONS: WorldCinemaCollection[] = [
  { originCountry: 'KR' },
  { originCountry: 'JP' },
  { originCountry: 'IR' },
  { originCountry: 'FR' },
  { originCountry: 'IT' },
  { originCountry: 'ES' },
  { originCountry: 'IN' },
  { originCountry: 'TR' },
  { originCountry: 'CN' },
  { originCountry: 'HK' },
  { originCountry: 'TW' },
  { originCountry: 'DE' },
  { originCountry: 'MX' },
  { originCountry: 'AR' },
  { originCountry: 'BR' },
];

const ADDITIONAL_ORIGIN_COUNTRY_CODES = ['SE', 'NO', 'DK'];

export function getOriginCountryLabel(code: string): string {
  const normalized = code.trim().toUpperCase();
  const translated = translateOriginCountryLabel(normalized);
  if (translated !== normalized) {
    return translated;
  }

  const regionLabel = REGION_OPTIONS.find((option) => option.code === normalized)?.label;
  if (regionLabel) {
    return regionLabel;
  }

  return normalized;
}

export function getOriginCountryOptions(): { code: string; label: string }[] {
  return [
    ...WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) => ({
      code: collection.originCountry,
      label: getOriginCountryLabel(collection.originCountry),
    })),
    ...REGION_OPTIONS.filter(
      (option) =>
        !WORLD_CINEMA_CURATED_COLLECTIONS.some(
          (collection) => collection.originCountry === option.code,
        ),
    ),
    ...ADDITIONAL_ORIGIN_COUNTRY_CODES.map((code) => ({
      code,
      label: getOriginCountryLabel(code),
    })),
  ].filter(
    (option, index, options) =>
      options.findIndex((candidate) => candidate.code === option.code) === index,
  );
}

export function getWorldCinemaCollectionLabel(originCountry: string): string {
  const normalized = originCountry.trim().toUpperCase();
  const curated = WORLD_CINEMA_CURATED_COLLECTIONS.find(
    (collection) => collection.originCountry === normalized,
  );

  if (curated) {
    return translateWorldCinemaCollection(normalized);
  }

  return getOriginCountryLabel(normalized);
}

export function getWorldCinemaTabFlag(originCountry: string): string {
  return countryCodeToFlagEmoji(originCountry);
}
