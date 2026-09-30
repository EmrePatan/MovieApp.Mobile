import type { AdvancedDiscoverSort } from '../advanced-discover-types';
import {
  createDefaultStreamingDiscoverState,
  type StreamingDiscoverMediaType,
  type StreamingDiscoverState,
} from '../streaming-discover-types';
import { parseTvDiscoverStatuses } from '../tv-discover-status';
import type { WatchMonetizationType } from '../watch-provider-types';
import {
  parseCommaSeparatedIds,
  parseLanguageCodeParam,
  parseOriginCountryParam,
  parseRatingParam,
  parseRuntimeParam,
  parseVoteCountParam,
  parseYearParam,
  readRouteParam,
} from './parse-route-helpers';

const MEDIA_TYPES = new Set<StreamingDiscoverMediaType>(['movie', 'tv']);
const MONETIZATION_TYPES = new Set<WatchMonetizationType>(['stream', 'free', 'ads', 'rent', 'buy']);
const SORT_VALUES = new Set<AdvancedDiscoverSort>([
  'popularity_desc',
  'rating_desc',
  'newest',
  'oldest',
]);

function parseMediaType(value: string | undefined): StreamingDiscoverMediaType {
  if (value && MEDIA_TYPES.has(value as StreamingDiscoverMediaType)) {
    return value as StreamingDiscoverMediaType;
  }

  return 'movie';
}

function parseRegion(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : fallback;
}

function parseProviderIds(value: string | string[] | undefined): number[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const ids = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  return Array.from(new Set(ids));
}

function parseMonetizationTypes(value: string | string[] | undefined): WatchMonetizationType[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const types = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is WatchMonetizationType =>
      MONETIZATION_TYPES.has(entry as WatchMonetizationType),
    );

  return Array.from(new Set(types));
}

function parseSort(value: string | undefined): AdvancedDiscoverSort {
  if (value && SORT_VALUES.has(value as AdvancedDiscoverSort)) {
    return value as AdvancedDiscoverSort;
  }

  return 'popularity_desc';
}

type StreamingDiscoverRouteParams = Record<string, string | string[] | undefined>;

export function parseStreamingDiscoverParams(
  params: StreamingDiscoverRouteParams,
  defaultWatchRegion?: string,
): StreamingDiscoverState {
  const defaults = createDefaultStreamingDiscoverState(defaultWatchRegion);
  const mediaType = parseMediaType(readRouteParam(params.mediaType));
  const monetizationTypes = parseMonetizationTypes(params.watchMonetizationType);

  return {
    mediaType,
    watchRegion: parseRegion(readRouteParam(params.watchRegion), defaults.watchRegion),
    watchProviderIds: parseProviderIds(params.watchProviderId),
    watchMonetizationTypes:
      monetizationTypes.length > 0 ? monetizationTypes : defaults.watchMonetizationTypes,
    genreIds: parseCommaSeparatedIds(params.genres),
    year: parseYearParam(readRouteParam(params.year)),
    yearFrom: parseYearParam(readRouteParam(params.yearFrom)),
    yearTo: parseYearParam(readRouteParam(params.yearTo)),
    minRating: parseRatingParam(readRouteParam(params.minRating)),
    minVoteCount: parseVoteCountParam(readRouteParam(params.minVoteCount)),
    minRuntimeMinutes: parseRuntimeParam(readRouteParam(params.minRuntime)),
    maxRuntimeMinutes: parseRuntimeParam(readRouteParam(params.maxRuntime)),
    originalLanguage: parseLanguageCodeParam(readRouteParam(params.language)),
    originCountry: parseOriginCountryParam(readRouteParam(params.originCountry)),
    keywordIds: parseCommaSeparatedIds(params.keywords ?? params.keywordId),
    tvStatuses: mediaType === 'tv' ? parseTvDiscoverStatuses(params.tvStatus ?? params.tvStatuses) : [],
    sort: parseSort(readRouteParam(params.sort)),
  };
}

export function serializeStreamingDiscoverParams(
  state: StreamingDiscoverState,
): Record<string, string> {
  const params: Record<string, string> = {
    mediaType: state.mediaType,
    watchRegion: state.watchRegion,
  };

  if (state.watchProviderIds.length > 0) {
    params.watchProviderId = state.watchProviderIds.join(',');
  }

  if (state.watchMonetizationTypes.length > 0) {
    params.watchMonetizationType = state.watchMonetizationTypes.join(',');
  }

  if (state.genreIds.length > 0) {
    params.genres = state.genreIds.join(',');
  }

  if (state.year != null) {
    params.year = String(state.year);
  }

  if (state.yearFrom != null) {
    params.yearFrom = String(state.yearFrom);
  }

  if (state.yearTo != null) {
    params.yearTo = String(state.yearTo);
  }

  if (state.minRating != null) {
    params.minRating = String(state.minRating);
  }

  if (state.minVoteCount != null) {
    params.minVoteCount = String(state.minVoteCount);
  }

  if (state.minRuntimeMinutes != null) {
    params.minRuntime = String(state.minRuntimeMinutes);
  }

  if (state.maxRuntimeMinutes != null) {
    params.maxRuntime = String(state.maxRuntimeMinutes);
  }

  if (state.originalLanguage) {
    params.language = state.originalLanguage;
  }

  if (state.originCountry) {
    params.originCountry = state.originCountry;
  }

  if (state.keywordIds.length > 0) {
    params.keywords = state.keywordIds.join(',');
  }

  if (state.mediaType === 'tv' && state.tvStatuses.length > 0) {
    params.tvStatus = state.tvStatuses.join(',');
  }

  if (state.sort && state.sort !== 'popularity_desc') {
    params.sort = state.sort;
  }

  return params;
}

export function serializeStreamingDiscoverRoute(state: StreamingDiscoverState): string {
  const params = serializeStreamingDiscoverParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/streaming-discover?${search}` : '/streaming-discover';
}

export function createStreamingDiscoverHref(
  overrides: Partial<StreamingDiscoverState> = {},
  defaultWatchRegion?: string,
): string {
  const base = createDefaultStreamingDiscoverState(defaultWatchRegion);

  return serializeStreamingDiscoverRoute({
    ...base,
    ...overrides,
  });
}
