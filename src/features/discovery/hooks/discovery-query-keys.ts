import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
} from '../advanced-discover-types';
import { DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE } from '../advanced-discover-types';
import type {
  DiscoveryBrowseFilters,
  DiscoveryBrowseMode,
  DiscoveryTypeFilter,
} from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';

export function discoveryBrowseInfiniteQueryKey(
  mode: DiscoveryBrowseMode,
  type: DiscoveryTypeFilter = 'all',
  filters: DiscoveryBrowseFilters,
  pageSize = DEFAULT_DISCOVERY_PAGE_SIZE,
) {
  return [
    'discovery',
    'browse',
    mode,
    type,
    filters.genreIds,
    filters.year,
    filters.minRating,
    filters.language,
    filters.sort,
    pageSize,
  ] as const;
}

export function genresQueryKey() {
  return ['genres'] as const;
}

export function advancedDiscoverInfiniteQueryKey(
  mediaType: AdvancedDiscoverMediaType,
  filters: AdvancedDiscoverFilters,
  pageSize = DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
) {
  return [
    'discovery',
    'advanced',
    mediaType,
    filters.genreIds,
    filters.year,
    filters.yearFrom,
    filters.yearTo,
    filters.minRating,
    filters.minRuntimeMinutes,
    filters.maxRuntimeMinutes,
    filters.originalLanguage,
    filters.originCountry,
    filters.sort,
    pageSize,
  ] as const;
}
