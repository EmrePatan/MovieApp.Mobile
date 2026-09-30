import type { SearchContentType } from '@/models/api/pagination';
import type { SearchResponse } from '@/features/search/types';
import { translateDiscoveryBrowseMode } from '@/i18n/catalog-labels';
import type { TvDiscoverStatus } from './tv-discover-status';

export type DiscoveryTypeFilter = SearchContentType;

export type DiscoveryBrowseMode = 'trending' | 'top_rated' | 'new_releases';

export type DiscoverySort =
  | 'popularity_desc'
  | 'popularity_asc'
  | 'rating_desc'
  | 'rating_asc'
  | 'release_desc'
  | 'release_asc'
  | 'title_asc'
  | 'title_desc';

export interface Genre {
  id: string;
  name: string;
}

export interface ExplorePreviewResponse {
  trending: SearchResponse;
  topRated: SearchResponse;
  newReleases: SearchResponse;
}

export interface DiscoveryBrowseFilters {
  genreIds: string[];
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  minVoteCount: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  language: string | null;
  originCountry: string | null;
  keywordIds: string[];
  tvStatuses: TvDiscoverStatus[];
  sort: DiscoverySort | null;
}

export interface DiscoveryBrowseState {
  mode: DiscoveryBrowseMode;
  type: DiscoveryTypeFilter;
  filters: DiscoveryBrowseFilters;
}

export interface DiscoveryBrowseRequest extends DiscoveryBrowseFilters {
  mode: DiscoveryBrowseMode;
  type?: DiscoveryTypeFilter;
  page?: number;
  pageSize?: number;
}

export const DEFAULT_DISCOVERY_PAGE_SIZE = 20;

export const DISCOVERY_BROWSE_MODES: DiscoveryBrowseMode[] = [
  'trending',
  'top_rated',
  'new_releases',
];

export const DISCOVERY_TYPE_OPTIONS: DiscoveryTypeFilter[] = ['all', 'movie', 'tv'];

export const DISCOVERY_SORT_OPTIONS: DiscoverySort[] = [
  'popularity_desc',
  'popularity_asc',
  'rating_desc',
  'rating_asc',
  'release_desc',
  'release_asc',
  'title_asc',
  'title_desc',
];

export const DISCOVERY_SORT_VALUES = DISCOVERY_SORT_OPTIONS;

export function getDefaultSortForMode(mode: DiscoveryBrowseMode): DiscoverySort {
  switch (mode) {
    case 'top_rated':
      return 'rating_desc';
    case 'new_releases':
      return 'release_desc';
    case 'trending':
    default:
      return 'popularity_desc';
  }
}

export function getDiscoverTitle(mode: DiscoveryBrowseMode): string {
  return translateDiscoveryBrowseMode(mode);
}

export function createDefaultDiscoveryFilters(
  mode: DiscoveryBrowseMode = 'trending',
): DiscoveryBrowseFilters {
  return {
    genreIds: [],
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    minVoteCount: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    language: null,
    originCountry: null,
    keywordIds: [],
    tvStatuses: [],
    sort: getDefaultSortForMode(mode),
  };
}

export function createDefaultDiscoveryState(): DiscoveryBrowseState {
  return {
    mode: 'trending',
    type: 'all',
    filters: createDefaultDiscoveryFilters('trending'),
  };
}

/** User filters only — sort is never counted here. */
export function countActiveDiscoveryUserFilters(
  filters: DiscoveryBrowseFilters,
  type: DiscoveryTypeFilter = 'all',
): number {
  let count = 0;

  if (type !== 'all') {
    count += 1;
  }

  if (filters.genreIds.length > 0) {
    count += 1;
  }

  if (filters.year != null || filters.yearFrom != null || filters.yearTo != null) {
    count += 1;
  }

  if (filters.minRating != null) {
    count += 1;
  }

  if (filters.minVoteCount != null) {
    count += 1;
  }

  if (filters.minRuntimeMinutes != null || filters.maxRuntimeMinutes != null) {
    count += 1;
  }

  if (filters.language) {
    count += 1;
  }

  if (filters.originCountry) {
    count += 1;
  }

  if (filters.keywordIds.length > 0) {
    count += 1;
  }

  if (filters.tvStatuses.length > 0) {
    count += 1;
  }

  return count;
}

export function hasActiveDiscoveryUserFilters(
  filters: DiscoveryBrowseFilters,
  type: DiscoveryTypeFilter = 'all',
): boolean {
  return countActiveDiscoveryUserFilters(filters, type) > 0;
}

export function hasNonDefaultDiscoverySort(
  filters: DiscoveryBrowseFilters,
  mode: DiscoveryBrowseMode,
): boolean {
  return Boolean(filters.sort && filters.sort !== getDefaultSortForMode(mode));
}

/** @deprecated Prefer hasActiveDiscoveryUserFilters — includes sort historically. */
export function countActiveDiscoveryFilters(
  filters: DiscoveryBrowseFilters,
  mode: DiscoveryBrowseMode,
  type: DiscoveryTypeFilter = 'all',
): number {
  let count = countActiveDiscoveryUserFilters(filters, type);

  if (hasNonDefaultDiscoverySort(filters, mode)) {
    count += 1;
  }

  return count;
}

export function hasActiveDiscoveryFilters(
  filters: DiscoveryBrowseFilters,
  mode: DiscoveryBrowseMode,
  type: DiscoveryTypeFilter = 'all',
): boolean {
  return countActiveDiscoveryFilters(filters, mode, type) > 0;
}

export function clearDiscoveryUserFilters(
  filters: DiscoveryBrowseFilters,
  mode: DiscoveryBrowseMode,
): DiscoveryBrowseFilters {
  return {
    ...createDefaultDiscoveryFilters(mode),
    sort: filters.sort ?? getDefaultSortForMode(mode),
  };
}
