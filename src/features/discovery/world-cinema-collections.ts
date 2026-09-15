import { REGION_OPTIONS } from '@/features/regions/region-options';
import type { WorldCinemaCollection } from './world-cinema-types';

export const WORLD_CINEMA_CURATED_COLLECTIONS: WorldCinemaCollection[] = [
  { originCountry: 'KR', label: 'Korean Cinema' },
  { originCountry: 'JP', label: 'Japanese Cinema' },
  { originCountry: 'IR', label: 'Iranian Cinema' },
  { originCountry: 'FR', label: 'French Cinema' },
  { originCountry: 'IT', label: 'Italian Cinema' },
  { originCountry: 'ES', label: 'Spanish Cinema' },
  { originCountry: 'IN', label: 'Indian Cinema' },
  { originCountry: 'TR', label: 'Turkish Cinema' },
  { originCountry: 'CN', label: 'Chinese Cinema' },
  { originCountry: 'HK', label: 'Hong Kong Cinema' },
  { originCountry: 'TW', label: 'Taiwanese Cinema' },
  { originCountry: 'DE', label: 'German Cinema' },
  { originCountry: 'MX', label: 'Mexican Cinema' },
  { originCountry: 'AR', label: 'Argentine Cinema' },
  { originCountry: 'BR', label: 'Brazilian Cinema' },
];

export const WORLD_CINEMA_COUNTRY_LABELS: Record<string, string> = {
  KR: 'South Korea',
  JP: 'Japan',
  IR: 'Iran',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  IN: 'India',
  TR: 'Türkiye',
  CN: 'China',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  DE: 'Germany',
  MX: 'Mexico',
  AR: 'Argentina',
  BR: 'Brazil',
};

const ADDITIONAL_ORIGIN_COUNTRY_OPTIONS = [
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
];

export const ORIGIN_COUNTRY_OPTIONS = [
  ...WORLD_CINEMA_CURATED_COLLECTIONS.map((collection) => ({
    code: collection.originCountry,
    label:
      WORLD_CINEMA_COUNTRY_LABELS[collection.originCountry] ??
      collection.label.replace(' Cinema', ''),
  })),
  ...REGION_OPTIONS.filter((option) => !(option.code in WORLD_CINEMA_COUNTRY_LABELS)),
  ...ADDITIONAL_ORIGIN_COUNTRY_OPTIONS,
].filter(
  (option, index, options) =>
    options.findIndex((candidate) => candidate.code === option.code) === index,
);

export function getOriginCountryLabel(code: string): string {
  const normalized = code.trim().toUpperCase();

  return (
    WORLD_CINEMA_COUNTRY_LABELS[normalized] ??
    ORIGIN_COUNTRY_OPTIONS.find((option) => option.code === normalized)?.label ??
    normalized
  );
}

export function getWorldCinemaCollectionLabel(originCountry: string): string {
  const curated = WORLD_CINEMA_CURATED_COLLECTIONS.find(
    (collection) => collection.originCountry === originCountry,
  );

  return curated?.label ?? `${getOriginCountryLabel(originCountry)} Cinema`;
}
