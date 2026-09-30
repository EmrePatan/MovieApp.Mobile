export const CATALOG_MIN_RATING_OPTIONS: readonly (number | null)[] = [
  null,
  6,
  7,
  8,
  9,
] as const;

export const CATALOG_VOTE_COUNT_OPTIONS: readonly (number | null)[] = [
  null,
  100,
  500,
  1000,
  5000,
] as const;

export type CatalogYearPresetKey =
  | 'any'
  | '2020s'
  | '2010s'
  | '2000s'
  | '1990s'
  | 'custom';

export interface CatalogYearPreset {
  key: CatalogYearPresetKey;
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
}

export const CATALOG_YEAR_PRESETS: readonly CatalogYearPreset[] = [
  { key: 'any', year: null, yearFrom: null, yearTo: null },
  { key: '2020s', year: null, yearFrom: 2020, yearTo: 2029 },
  { key: '2010s', year: null, yearFrom: 2010, yearTo: 2019 },
  { key: '2000s', year: null, yearFrom: 2000, yearTo: 2009 },
  { key: '1990s', year: null, yearFrom: 1990, yearTo: 1999 },
] as const;

export type CatalogRuntimePresetKey =
  | 'any'
  | 'under90'
  | 'range90to120'
  | 'over120'
  | 'custom';

export interface CatalogRuntimePreset {
  key: CatalogRuntimePresetKey;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
}

export const CATALOG_RUNTIME_PRESETS: readonly CatalogRuntimePreset[] = [
  { key: 'any', minRuntimeMinutes: null, maxRuntimeMinutes: null },
  { key: 'under90', minRuntimeMinutes: null, maxRuntimeMinutes: 89 },
  { key: 'range90to120', minRuntimeMinutes: 90, maxRuntimeMinutes: 120 },
  { key: 'over120', minRuntimeMinutes: 121, maxRuntimeMinutes: null },
] as const;

export function resolveCatalogYearPresetKey(input: {
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
}): CatalogYearPresetKey {
  if (input.year != null) {
    return 'custom';
  }

  for (const preset of CATALOG_YEAR_PRESETS) {
    if (
      preset.key !== 'any' &&
      preset.yearFrom === input.yearFrom &&
      preset.yearTo === input.yearTo
    ) {
      return preset.key;
    }
  }

  if (input.yearFrom != null || input.yearTo != null) {
    return 'custom';
  }

  return 'any';
}

export function resolveCatalogRuntimePresetKey(input: {
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
}): CatalogRuntimePresetKey {
  for (const preset of CATALOG_RUNTIME_PRESETS) {
    if (
      preset.minRuntimeMinutes === input.minRuntimeMinutes &&
      preset.maxRuntimeMinutes === input.maxRuntimeMinutes
    ) {
      return preset.key;
    }
  }

  if (input.minRuntimeMinutes != null || input.maxRuntimeMinutes != null) {
    return 'custom';
  }

  return 'any';
}
