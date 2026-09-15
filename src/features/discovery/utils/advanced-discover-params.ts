import {
  ADVANCED_DISCOVER_SORT_OPTIONS,
  createDefaultAdvancedDiscoverFilters,
  createDefaultAdvancedDiscoverState,
  type AdvancedDiscoverFilters,
  type AdvancedDiscoverMediaType,
  type AdvancedDiscoverSort,
  type AdvancedDiscoverState,
} from '../advanced-discover-types';
import type { WatchMonetizationType } from '../watch-provider-types';

const MEDIA_TYPES = new Set<AdvancedDiscoverMediaType>(['movie', 'tv']);
const SORT_VALUES = new Set<AdvancedDiscoverSort>(
  ADVANCED_DISCOVER_SORT_OPTIONS.map((option) => option.value),
);
const MONETIZATION_TYPES = new Set<WatchMonetizationType>(['stream', 'free', 'ads', 'rent', 'buy']);

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseMediaType(value: string | undefined): AdvancedDiscoverMediaType {
  if (value && MEDIA_TYPES.has(value as AdvancedDiscoverMediaType)) {
    return value as AdvancedDiscoverMediaType;
  }

  return 'movie';
}

function parseSort(value: string | undefined): AdvancedDiscoverSort {
  if (value && SORT_VALUES.has(value as AdvancedDiscoverSort)) {
    return value as AdvancedDiscoverSort;
  }

  return 'popularity_desc';
}

function parseGenreIds(value: string | string[] | undefined): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const ids = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return Array.from(new Set(ids));
}

function parseYear(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1888 || parsed > 2100) {
    return null;
  }

  return parsed;
}

function parseMinRating(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    return null;
  }

  return parsed;
}

function parseRuntime(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 400) {
    return null;
  }

  return parsed;
}

function parseLanguage(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function parseWatchRegion(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

function parseWatchProviderIds(value: string | string[] | undefined): number[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const ids = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  return Array.from(new Set(ids));
}

function parseWatchMonetizationTypes(value: string | string[] | undefined): WatchMonetizationType[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const types = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is WatchMonetizationType =>
      MONETIZATION_TYPES.has(entry as WatchMonetizationType),
    );

  return Array.from(new Set(types));
}

function parseOriginCountry(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

type AdvancedDiscoverRouteParams = Record<string, string | string[] | undefined>;

export function parseAdvancedDiscoverParams(
  params: AdvancedDiscoverRouteParams,
): AdvancedDiscoverState {
  const mediaType = parseMediaType(readParam(params.mediaType));

  const filters: AdvancedDiscoverFilters = {
    ...createDefaultAdvancedDiscoverFilters(),
    genreIds: parseGenreIds(params.genres),
    year: parseYear(readParam(params.year)),
    yearFrom: parseYear(readParam(params.yearFrom)),
    yearTo: parseYear(readParam(params.yearTo)),
    minRating: parseMinRating(readParam(params.minRating)),
    minRuntimeMinutes: parseRuntime(readParam(params.minRuntime)),
    maxRuntimeMinutes: parseRuntime(readParam(params.maxRuntime)),
    originalLanguage: parseLanguage(readParam(params.language)),
    originCountry: parseOriginCountry(readParam(params.originCountry)),
    watchRegion: parseWatchRegion(readParam(params.watchRegion)),
    watchProviderIds: parseWatchProviderIds(params.watchProviderId),
    watchMonetizationTypes: parseWatchMonetizationTypes(params.watchMonetizationType),
    sort: parseSort(readParam(params.sort)),
  };

  return { mediaType, filters };
}

export function serializeAdvancedDiscoverParams(
  state: AdvancedDiscoverState,
): Record<string, string> {
  const filters: AdvancedDiscoverFilters = {
    ...createDefaultAdvancedDiscoverFilters(),
    ...state.filters,
  };
  const params: Record<string, string> = {
    mediaType: state.mediaType,
  };

  if (filters.genreIds.length > 0) {
    params.genres = filters.genreIds.join(',');
  }

  if (filters.year != null) {
    params.year = String(filters.year);
  }

  if (filters.yearFrom != null) {
    params.yearFrom = String(filters.yearFrom);
  }

  if (filters.yearTo != null) {
    params.yearTo = String(filters.yearTo);
  }

  if (filters.minRating != null) {
    params.minRating = String(filters.minRating);
  }

  if (filters.minRuntimeMinutes != null) {
    params.minRuntime = String(filters.minRuntimeMinutes);
  }

  if (filters.maxRuntimeMinutes != null) {
    params.maxRuntime = String(filters.maxRuntimeMinutes);
  }

  if (filters.originalLanguage) {
    params.language = filters.originalLanguage;
  }

  if (filters.originCountry) {
    params.originCountry = filters.originCountry;
  }

  if (filters.watchRegion) {
    params.watchRegion = filters.watchRegion;
  }

  if (filters.watchProviderIds.length > 0) {
    params.watchProviderId = filters.watchProviderIds.join(',');
  }

  if (filters.watchMonetizationTypes.length > 0) {
    params.watchMonetizationType = filters.watchMonetizationTypes.join(',');
  }

  if (filters.sort && filters.sort !== 'popularity_desc') {
    params.sort = filters.sort;
  }

  return params;
}

export function serializeAdvancedDiscoverRoute(state: AdvancedDiscoverState): string {
  const params = serializeAdvancedDiscoverParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/advanced-discover?${search}` : '/advanced-discover';
}

export function createAdvancedDiscoverHref(
  overrides: {
    mediaType?: AdvancedDiscoverMediaType;
    filters?: Partial<AdvancedDiscoverFilters>;
  } = {},
): string {
  const base = createDefaultAdvancedDiscoverState();

  return serializeAdvancedDiscoverRoute({
    mediaType: overrides.mediaType ?? base.mediaType,
    filters: {
      ...createDefaultAdvancedDiscoverFilters(),
      ...overrides.filters,
    },
  });
}
