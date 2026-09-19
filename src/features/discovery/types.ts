import type { SearchContentType } from '@/models/api/pagination';
import type { SearchResponse } from '@/features/search/types';
import { translateDiscoveryBrowseMode } from '@/i18n/catalog-labels';

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
  minRating: number | null;
  language: string | null;
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
    minRating: null,
    language: null,
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

export function countActiveDiscoveryFilters(
  filters: DiscoveryBrowseFilters,
  mode: DiscoveryBrowseMode,
  type: DiscoveryTypeFilter = 'all',
): number {
  let count = 0;

  if (type !== 'all') {
    count += 1;
  }

  if (filters.genreIds.length > 0) {
    count += filters.genreIds.length;
  }

  if (filters.year != null) {
    count += 1;
  }

  if (filters.minRating != null) {
    count += 1;
  }

  if (filters.language) {
    count += 1;
  }

  if (filters.sort && filters.sort !== getDefaultSortForMode(mode)) {
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
