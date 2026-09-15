import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
} from '../advanced-discover-types';
import type { NowInTheatersState } from '../now-in-theaters-types';
import { NOW_IN_THEATERS_PREVIEW_SIZE } from '../now-in-theaters-types';
import type { StreamingDiscoverState } from '../streaming-discover-types';
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
    filters.watchRegion,
    filters.watchProviderIds,
    filters.watchMonetizationTypes,
    filters.sort,
    pageSize,
  ] as const;
}

export function discoveryWatchProvidersQueryKey(
  mediaType: AdvancedDiscoverMediaType,
  watchRegion: string,
) {
  return ['discovery', 'watch-providers', mediaType, watchRegion] as const;
}

export function nowInTheatersPreviewQueryKey(releaseRegion: string) {
  return ['discovery', 'now-in-theaters', 'preview', releaseRegion, NOW_IN_THEATERS_PREVIEW_SIZE] as const;
}

export function nowInTheatersInfiniteQueryKey(
  state: NowInTheatersState,
  pageSize: number,
) {
  return ['discovery', 'now-in-theaters', state.releaseRegion, pageSize] as const;
}

export function streamingDiscoverInfiniteQueryKey(
  state: StreamingDiscoverState,
  pageSize = DEFAULT_ADVANCED_DISCOVER_PAGE_SIZE,
) {
  return [
    'discovery',
    'streaming',
    state.mediaType,
    state.watchRegion,
    state.watchProviderIds,
    state.watchMonetizationTypes,
    state.minRating,
    state.sort,
    pageSize,
  ] as const;
}
