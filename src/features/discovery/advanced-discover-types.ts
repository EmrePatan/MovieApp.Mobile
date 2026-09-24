import type { WatchMonetizationType } from './watch-provider-types';

export type AdvancedDiscoverMediaType = 'movie' | 'tv';

export type AdvancedDiscoverSort =
  | 'popularity_desc'
  | 'rating_desc'
  | 'newest'
  | 'oldest';

export type GenreMatchMode = 'all' | 'any';

export type DiscoverReleaseType =
  | 'premiere'
  | 'theatrical_limited'
  | 'theatrical'
  | 'digital'
  | 'physical'
  | 'television';

export interface AdvancedDiscoverFilters {
  genreIds: string[];
  genreMatch: GenreMatchMode;
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  maxRating: number | null;
  minVoteCount: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
  certification: string | null;
  certificationCountry: string | null;
  releaseTypes: DiscoverReleaseType[];
  watchRegion: string | null;
  watchProviderIds: number[];
  watchMonetizationTypes: WatchMonetizationType[];
  sort: AdvancedDiscoverSort | null;
}

export interface AdvancedDiscoverState {
  mediaType: AdvancedDiscoverMediaType;
  filters: AdvancedDiscoverFilters;
}

export interface AdvancedDiscoverRequest extends AdvancedDiscoverFilters {
  mediaType: AdvancedDiscoverMediaType;
  page?: number;
  pageSize?: number;
}

export type { WatchMonetizationType };

export const DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE = 20;

export const ADVANCED_DISCOVER_MEDIA_OPTIONS: AdvancedDiscoverMediaType[] = ['movie', 'tv'];

export const ADVANCED_DISCOVER_SORT_OPTIONS: AdvancedDiscoverSort[] = [
  'popularity_desc',
  'rating_desc',
  'newest',
  'oldest',
];

export const ADVANCED_DISCOVER_VOTE_COUNT_OPTIONS: (number | null)[] = [
  null,
  50,
  100,
  500,
  1000,
];

export const ADVANCED_DISCOVER_RUNTIME_PRESETS: {
  key: string;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
}[] = [
  { key: 'any', minRuntimeMinutes: null, maxRuntimeMinutes: null },
  { key: 'under90', minRuntimeMinutes: null, maxRuntimeMinutes: 89 },
  { key: 'range90to120', minRuntimeMinutes: 90, maxRuntimeMinutes: 120 },
  { key: 'over120', minRuntimeMinutes: 121, maxRuntimeMinutes: null },
];

export function createDefaultAdvancedDiscoverFilters(): AdvancedDiscoverFilters {
  return {
    genreIds: [],
    genreMatch: 'all',
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    maxRating: null,
    minVoteCount: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    originalLanguage: null,
    originCountry: null,
    certification: null,
    certificationCountry: null,
    releaseTypes: [],
    watchRegion: null,
    watchProviderIds: [],
    watchMonetizationTypes: [],
    sort: 'popularity_desc',
  };
}

export function createDefaultAdvancedDiscoverState(): AdvancedDiscoverState {
  return {
    mediaType: 'movie',
    filters: createDefaultAdvancedDiscoverFilters(),
  };
}

export function countActiveAdvancedDiscoverFilters(
  filters: AdvancedDiscoverFilters,
  mediaType: AdvancedDiscoverMediaType = 'movie',
): number {
  let count = 0;

  if (mediaType !== 'movie') {
    count += 1;
  }

  if (filters.genreIds.length > 0) {
    count += filters.genreIds.length;
    if (filters.genreIds.length > 1 && filters.genreMatch === 'any') {
      count += 1;
    }
  }

  if (filters.year != null) {
    count += 1;
  }

  if (filters.yearFrom != null || filters.yearTo != null) {
    count += 1;
  }

  if (filters.minRating != null) {
    count += 1;
  }

  if (filters.maxRating != null) {
    count += 1;
  }

  if (filters.minVoteCount != null) {
    count += 1;
  }

  if (filters.minRuntimeMinutes != null || filters.maxRuntimeMinutes != null) {
    count += 1;
  }

  if (filters.originalLanguage) {
    count += 1;
  }

  if (filters.originCountry) {
    count += 1;
  }

  if (filters.certification) {
    count += 1;
  }

  if (filters.releaseTypes.length > 0) {
    count += filters.releaseTypes.length;
  }

  if (filters.watchRegion) {
    count += 1;
  }

  if (filters.watchProviderIds.length > 0) {
    count += filters.watchProviderIds.length;
  }

  if (filters.watchMonetizationTypes.length > 0) {
    count += filters.watchMonetizationTypes.length;
  }

  if (filters.sort && filters.sort !== 'popularity_desc') {
    count += 1;
  }

  return count;
}

export function hasActiveAdvancedDiscoverFilters(
  filters: AdvancedDiscoverFilters,
  mediaType: AdvancedDiscoverMediaType = 'movie',
): boolean {
  return countActiveAdvancedDiscoverFilters(filters, mediaType) > 0;
}

export function hasStreamingAvailabilityFilters(filters: AdvancedDiscoverFilters): boolean {
  return filters.watchProviderIds.length > 0 || filters.watchMonetizationTypes.length > 0;
}

export function resolveAdvancedDiscoverWatchRegion(
  filters: AdvancedDiscoverFilters,
  userRegion: string,
): string | null {
  if (!hasStreamingAvailabilityFilters(filters)) {
    return filters.watchRegion;
  }

  return filters.watchRegion ?? userRegion;
}

export function ensureStreamingDraftDefaults(
  filters: AdvancedDiscoverFilters,
  userRegion: string,
): AdvancedDiscoverFilters {
  let next = filters;

  if (next.watchProviderIds.length > 0 && next.watchMonetizationTypes.length === 0) {
    next = { ...next, watchMonetizationTypes: ['stream'] };
  }

  if (hasStreamingAvailabilityFilters(next) && !next.watchRegion) {
    next = { ...next, watchRegion: userRegion };
  }

  if (next.certification && !next.certificationCountry) {
    next = { ...next, certificationCountry: userRegion };
  }

  return next;
}
