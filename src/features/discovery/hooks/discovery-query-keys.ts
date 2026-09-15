import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
} from '../advanced-discover-types';
import type { NowInTheatersState } from '../now-in-theaters-types';
import { NOW_IN_THEATERS_PREVIEW_SIZE } from '../now-in-theaters-types';
import { ON_TV_THIS_WEEK_PREVIEW_SIZE } from '../on-tv-this-week-types';
import type { WorldCinemaState } from '../world-cinema-types';
import { WORLD_CINEMA_PREVIEW_SIZE } from '../world-cinema-types';
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
  userRegion?: string,
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
    userRegion ?? 'pending',
    pageSize,
  ] as const;
}

export function discoveryWatchProvidersQueryKey(
  mediaType: AdvancedDiscoverMediaType,
  watchRegion: string,
) {
  return ['discovery', 'watch-providers', mediaType, watchRegion] as const;
}

export function worldCinemaPreviewQueryKey(
  mediaType: WorldCinemaState['mediaType'],
  originCountry: string,
) {
  return ['discovery', 'world-cinema', 'preview', mediaType, originCountry, WORLD_CINEMA_PREVIEW_SIZE] as const;
}

export function worldCinemaInfiniteQueryKey(
  state: WorldCinemaState,
  pageSize: number,
) {
  return [
    'discovery',
    'world-cinema',
    state.mediaType,
    state.originCountry,
    state.sort,
    pageSize,
  ] as const;
}

export function onTvThisWeekPreviewQueryKey() {
  return ['discovery', 'on-tv-this-week', 'preview', ON_TV_THIS_WEEK_PREVIEW_SIZE] as const;
}

export function onTvThisWeekInfiniteQueryKey(pageSize: number) {
  return ['discovery', 'on-tv-this-week', pageSize] as const;
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
