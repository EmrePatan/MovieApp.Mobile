import type { AdvancedDiscoverSort } from './advanced-discover-types';
import { FALLBACK_USER_REGION } from '@/features/regions/region-options';
import type { WatchMonetizationType } from './watch-provider-types';
import type { TvDiscoverStatus } from './tv-discover-status';

export type StreamingDiscoverMediaType = 'movie' | 'tv';

export const DEFAULT_STREAMING_DISCOVER_MEDIA_TYPE: StreamingDiscoverMediaType = 'movie';
export const DEFAULT_STREAMING_DISCOVER_SORT: AdvancedDiscoverSort = 'popularity_desc';

export interface StreamingDiscoverState {
  mediaType: StreamingDiscoverMediaType;
  watchRegion: string;
  watchProviderIds: number[];
  watchMonetizationTypes: WatchMonetizationType[];
  genreIds: string[];
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  minVoteCount: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
  keywordIds: string[];
  tvStatuses: TvDiscoverStatus[];
  sort: AdvancedDiscoverSort | null;
}

export function createDefaultStreamingDiscoverState(
  watchRegion: string = FALLBACK_USER_REGION,
): StreamingDiscoverState {
  return {
    mediaType: DEFAULT_STREAMING_DISCOVER_MEDIA_TYPE,
    watchRegion,
    watchProviderIds: [],
    watchMonetizationTypes: ['stream'],
    genreIds: [],
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    minVoteCount: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    originalLanguage: null,
    originCountry: null,
    keywordIds: [],
    tvStatuses: [],
    sort: DEFAULT_STREAMING_DISCOVER_SORT,
  };
}

/**
 * User filters only — provider, watch region, and stream monetization are screen context.
 */
export function hasActiveStreamingUserFilters(state: StreamingDiscoverState): boolean {
  if (state.mediaType !== DEFAULT_STREAMING_DISCOVER_MEDIA_TYPE) {
    return true;
  }

  if (state.genreIds.length > 0) {
    return true;
  }

  if (state.year != null || state.yearFrom != null || state.yearTo != null) {
    return true;
  }

  if (state.minRating != null) {
    return true;
  }

  if (state.minVoteCount != null) {
    return true;
  }

  if (state.minRuntimeMinutes != null || state.maxRuntimeMinutes != null) {
    return true;
  }

  if (state.originalLanguage) {
    return true;
  }

  if (state.originCountry) {
    return true;
  }

  if (state.keywordIds.length > 0) {
    return true;
  }

  if (state.tvStatuses.length > 0) {
    return true;
  }

  return false;
}

export function hasNonDefaultStreamingSort(state: StreamingDiscoverState): boolean {
  return Boolean(state.sort && state.sort !== DEFAULT_STREAMING_DISCOVER_SORT);
}

export function clearStreamingUserFilters(state: StreamingDiscoverState): StreamingDiscoverState {
  return {
    ...createDefaultStreamingDiscoverState(state.watchRegion),
    watchProviderIds: state.watchProviderIds,
    watchMonetizationTypes: state.watchMonetizationTypes,
    sort: state.sort,
  };
}
