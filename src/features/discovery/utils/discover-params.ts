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

const BROWSE_MODES = new Set<DiscoveryBrowseMode>(
  DISCOVERY_BROWSE_MODES.map((option) => option.value),
);
const TYPE_FILTERS = new Set<DiscoveryTypeFilter>(['all', 'movie', 'tv']);
const SORT_VALUES = new Set<DiscoverySort>(DISCOVERY_SORT_VALUES);

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

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

function parseGenreIds(value: string | string[] | undefined): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const ids = rawValues
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return Array.from(new Set(ids));
}

function parseYear(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1888 || parsed > 2100) {
    return null;
  }

  return parsed;
}

function parseMinRating(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    return null;
  }

  return parsed;
}

function parseLanguage(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

type DiscoverRouteParams = Record<string, string | string[] | undefined>;

export function parseDiscoverParams(params: DiscoverRouteParams): DiscoveryBrowseState {
  const mode = parseBrowseMode(readParam(params.mode));
  const type = parseTypeFilter(readParam(params.type));

  const filters: DiscoveryBrowseFilters = {
    ...createDefaultDiscoveryFilters(mode),
    genreIds: parseGenreIds(params.genres),
    year: parseYear(readParam(params.year)),
    minRating: parseMinRating(readParam(params.minRating)),
    language: parseLanguage(readParam(params.language)),
    sort: parseSort(readParam(params.sort), mode),
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

  if (state.filters.minRating != null) {
    params.minRating = String(state.filters.minRating);
  }

  if (state.filters.language) {
    params.language = state.filters.language;
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
  return search.length > 0 ? `/discover?${search}` : '/discover';
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
