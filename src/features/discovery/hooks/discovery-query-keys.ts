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
