import type { WatchMonetizationType } from './watch-provider-types';

export type AdvancedDiscoverMediaType = 'movie' | 'tv';

export type AdvancedDiscoverSort =
  | 'popularity_desc'
  | 'rating_desc'
  | 'newest'
  | 'oldest';

export interface AdvancedDiscoverFilters {
  genreIds: string[];
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
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

export const ADVANCED_DISCOVER_MEDIA_OPTIONS: {
  value: AdvancedDiscoverMediaType;
  label: string;
}[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

export const ADVANCED_DISCOVER_SORT_OPTIONS: {
  value: AdvancedDiscoverSort;
  label: string;
}[] = [
  { value: 'popularity_desc', label: 'Popular' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export const ADVANCED_DISCOVER_RUNTIME_PRESETS: {
  label: string;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
}[] = [
  { label: 'Any', minRuntimeMinutes: null, maxRuntimeMinutes: null },
  { label: 'Under 90 min', minRuntimeMinutes: null, maxRuntimeMinutes: 89 },
  { label: '90–120 min', minRuntimeMinutes: 90, maxRuntimeMinutes: 120 },
  { label: 'Over 120 min', minRuntimeMinutes: 121, maxRuntimeMinutes: null },
];

export function createDefaultAdvancedDiscoverFilters(): AdvancedDiscoverFilters {
  return {
    genreIds: [],
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    originalLanguage: null,
    originCountry: null,
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

  if (filters.minRuntimeMinutes != null || filters.maxRuntimeMinutes != null) {
    count += 1;
  }

  if (filters.originalLanguage) {
    count += 1;
  }

  if (filters.originCountry) {
    count += 1;
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
