import {
  createDefaultDiscoveryFilters,
  createDefaultDiscoveryState,
  DISCOVERY_BROWSE_MODES,
  DISCOVERY_SORT_VALUES,
  getDefaultSortForMode,
  supportsWatchPlatforms,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseMode,
  type DiscoveryBrowseState,
  type DiscoverySort,
  type DiscoveryTypeFilter,
} from '../types';
import { parseTvDiscoverStatuses } from '../tv-discover-status';
import {
  parseCommaSeparatedIds,
  parseKeywordLabelsParam,
  serializeKeywordLabelsParam,
  parseLanguageCodeParam,
  parseOriginCountryParam,
  parseRatingParam,
  parseRuntimeParam,
  parseVoteCountParam,
  parseWatchProviderIdsParam,
  parseYearParam,
  readRouteParam,
} from './parse-route-helpers';

const BROWSE_MODES = new Set<DiscoveryBrowseMode>(DISCOVERY_BROWSE_MODES);
const TYPE_FILTERS = new Set<DiscoveryTypeFilter>(['all', 'movie', 'tv']);
const SORT_VALUES = new Set<DiscoverySort>(DISCOVERY_SORT_VALUES);

function parseBrowseMode(value: string | undefined): DiscoveryBrowseMode {
  const normalized = value === 'hidden-gems' ? 'hidden_gems' : value;
  if (normalized && BROWSE_MODES.has(normalized as DiscoveryBrowseMode)) {
    return normalized as DiscoveryBrowseMode;
  }

  return 'trending';
}

function parseTypeFilter(value: string | undefined): DiscoveryTypeFilter {
  if (value && TYPE_FILTERS.has(value as DiscoveryTypeFilter)) {
    return value as DiscoveryTypeFilter;
  }

  return 'all';
}

function parseSort(value: string | undefined, mode: DiscoveryBrowseMode): DiscoverySort {
  if (value && SORT_VALUES.has(value as DiscoverySort)) {
    return value as DiscoverySort;
  }

  return getDefaultSortForMode(mode);
}

type DiscoverRouteParams = Record<string, string | string[] | undefined>;

export function parseDiscoverParams(params: DiscoverRouteParams): DiscoveryBrowseState {
  const mode = parseBrowseMode(readRouteParam(params.mode));
  const type = parseTypeFilter(readRouteParam(params.type));
  const tvStatuses =
    type === 'movie' ? [] : parseTvDiscoverStatuses(params.tvStatus ?? params.tvStatuses);

  const filters: DiscoveryBrowseFilters = {
    ...createDefaultDiscoveryFilters(mode),
    genreIds: parseCommaSeparatedIds(params.genres),
    year: parseYearParam(readRouteParam(params.year)),
    yearFrom: parseYearParam(readRouteParam(params.yearFrom)),
    yearTo: parseYearParam(readRouteParam(params.yearTo)),
    minRating: parseRatingParam(readRouteParam(params.minRating)),
    minVoteCount: parseVoteCountParam(readRouteParam(params.minVoteCount)),
    minRuntimeMinutes: parseRuntimeParam(readRouteParam(params.minRuntime)),
    maxRuntimeMinutes: parseRuntimeParam(readRouteParam(params.maxRuntime)),
    language: parseLanguageCodeParam(readRouteParam(params.language)),
    originCountry: parseOriginCountryParam(readRouteParam(params.originCountry)),
    keywordIds: parseCommaSeparatedIds(params.keywords ?? params.keywordId),
    keywordLabels: parseKeywordLabelsParam(readRouteParam(params.keywordLabels)),
    tvStatuses,
    watchProviderIds: supportsWatchPlatforms(mode)
      ? parseWatchProviderIdsParam(params.watchProviderId)
      : [],
    sort: parseSort(readRouteParam(params.sort), mode),
  };

  return { mode, type, filters };
}

export function serializeDiscoverParams(state: DiscoveryBrowseState): Record<string, string> {
  const params: Record<string, string> = {
    mode: state.mode,
    type: state.type,
  };

  if (state.filters.genreIds.length > 0) {
    params.genres = state.filters.genreIds.join(',');
  }

  if (state.filters.year != null) {
    params.year = String(state.filters.year);
  }

  if (state.filters.yearFrom != null) {
    params.yearFrom = String(state.filters.yearFrom);
  }

  if (state.filters.yearTo != null) {
    params.yearTo = String(state.filters.yearTo);
  }

  if (state.filters.minRating != null) {
    params.minRating = String(state.filters.minRating);
  }

  if (state.filters.minVoteCount != null) {
    params.minVoteCount = String(state.filters.minVoteCount);
  }

  if (state.filters.minRuntimeMinutes != null) {
    params.minRuntime = String(state.filters.minRuntimeMinutes);
  }

  if (state.filters.maxRuntimeMinutes != null) {
    params.maxRuntime = String(state.filters.maxRuntimeMinutes);
  }

  if (state.filters.language) {
    params.language = state.filters.language;
  }

  if (state.filters.originCountry) {
    params.originCountry = state.filters.originCountry;
  }

  if (state.filters.keywordIds.length > 0) {
    params.keywords = state.filters.keywordIds.join(',');
    const keywordLabels = serializeKeywordLabelsParam(
      state.filters.keywordLabels,
      state.filters.keywordIds,
    );
    if (keywordLabels) {
      params.keywordLabels = keywordLabels;
    }
  }

  if (state.type !== 'movie' && state.filters.tvStatuses.length > 0) {
    params.tvStatus = state.filters.tvStatuses.join(',');
  }

  if (state.filters.watchProviderIds.length > 0) {
    params.watchProviderId = state.filters.watchProviderIds.join(',');
  }

  const defaultSort = getDefaultSortForMode(state.mode);
  if (state.filters.sort && state.filters.sort !== defaultSort) {
    params.sort = state.filters.sort;
  }

  return params;
}

export function serializeDiscoverRoute(state: DiscoveryBrowseState): string {
  const params = serializeDiscoverParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/discover-browse?${search}` : '/discover-browse';
}

export function createKeywordDiscoverHref(keyword: { id: string; name: string }): string {
  const mode: DiscoveryBrowseMode = 'trending';
  const filters: DiscoveryBrowseFilters = {
    ...createDefaultDiscoveryFilters(mode),
    keywordIds: [keyword.id],
    keywordLabels: { [keyword.id]: keyword.name },
  };

  return serializeDiscoverRoute({
    mode,
    type: 'all',
    filters,
  });
}

export function createDiscoverHref(
  overrides: {
    mode?: DiscoveryBrowseMode;
    type?: DiscoveryTypeFilter;
    filters?: Partial<DiscoveryBrowseFilters>;
  } = {},
): string {
  const base = createDefaultDiscoveryState();
  const mode = overrides.mode ?? base.mode;
  const filters: DiscoveryBrowseFilters = {
    ...createDefaultDiscoveryFilters(mode),
    ...overrides.filters,
  };

  return serializeDiscoverRoute({
    mode,
    type: overrides.type ?? base.type,
    filters,
  });
}
