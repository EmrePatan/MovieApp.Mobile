import {
  createDefaultDiscoveryFilters,
  createDefaultDiscoveryState,
  DISCOVERY_BROWSE_MODES,
  DISCOVERY_SORT_VALUES,
  getDefaultSortForMode,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseMode,
  type DiscoveryBrowseState,
  type DiscoverySort,
  type DiscoveryTypeFilter,
} from '../types';
import { parseTvDiscoverStatuses } from '../tv-discover-status';
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

const BROWSE_MODES = new Set<DiscoveryBrowseMode>(DISCOVERY_BROWSE_MODES);
const TYPE_FILTERS = new Set<DiscoveryTypeFilter>(['all', 'movie', 'tv']);
const SORT_VALUES = new Set<DiscoverySort>(DISCOVERY_SORT_VALUES);

function parseBrowseMode(value: string | undefined): DiscoveryBrowseMode {
  if (value && BROWSE_MODES.has(value as DiscoveryBrowseMode)) {
    return value as DiscoveryBrowseMode;
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

function parseKeywordLabelsParam(raw: string | undefined): Record<string, string> {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const labels: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.length > 0) {
        labels[key] = value;
      }
    }

    return labels;
  } catch {
    return {};
  }
}

function serializeKeywordLabelsParam(labels: Record<string, string>, keywordIds: string[]): string | undefined {
  if (keywordIds.length === 0) {
    return undefined;
  }

  const subset: Record<string, string> = {};
  for (const id of keywordIds) {
    const label = labels[id];
    if (label) {
      subset[id] = label;
    }
  }

  if (Object.keys(subset).length === 0) {
    return undefined;
  }

  return JSON.stringify(subset);
}

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
