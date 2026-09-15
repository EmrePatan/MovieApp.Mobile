import { REGION_OPTIONS } from '@/features/regions/region-options';
import type { WorldCinemaCollection } from './world-cinema-types';

export const WORLD_CINEMA_CURATED_COLLECTIONS: WorldCinemaCollection[] = [
  { originCountry: 'KR', label: 'Korean Cinema' },
  { originCountry: 'JP', label: 'Japanese Cinema' },
  { originCountry: 'FR', label: 'French Cinema' },
  { originCountry: 'IT', label: 'Italian Cinema' },
  { originCountry: 'ES', label: 'Spanish Cinema' },
  { originCountry: 'IN', label: 'Indian Cinema' },
  { originCountry: 'TR', label: 'Turkish Cinema' },
];

const ADDITIONAL_ORIGIN_COUNTRY_OPTIONS = [
  { code: 'KR', label: 'South Korea' },
  { code: 'JP', label: 'Japan' },
  { code: 'IN', label: 'India' },
  { code: 'CN', label: 'China' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
];

export const ORIGIN_COUNTRY_OPTIONS = [
  ...WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) => ({
    code: collection.originCountry,
    label: collection.label.replace(' Cinema', ''),
  })),
  ...REGION_OPTIONS,
  ...ADDITIONAL_ORIGIN_COUNTRY_OPTIONS,
].filter(
  (option, index, options) =>
    options.findIndex((candidate) => candidate.code === option.code) === index,
);

export function getOriginCountryLabel(code: string): string {
  return ORIGIN_COUNTRY_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

export function getWorldCinemaCollectionLabel(originCountry: string): string {
  const curated = WORLD_CINEMA_CURATED_COLLECTIONS.find(
    (collection) => collection.originCountry === originCountry,
  );

  return curated?.label ?? `${getOriginCountryLabel(originCountry)} Cinema`;
}
