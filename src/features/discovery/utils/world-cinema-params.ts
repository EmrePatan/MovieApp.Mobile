import type { AdvancedDiscoverMediaType, AdvancedDiscoverSort } from '../advanced-discover-types';
import { parseTvDiscoverStatuses } from '../tv-discover-status';
import {
  createDefaultWorldCinemaState,
  DEFAULT_WORLD_CINEMA_SORT,
  type WorldCinemaState,
} from '../world-cinema-types';
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

function parseMediaType(value: string | undefined): AdvancedDiscoverMediaType {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'tv' ? 'tv' : 'movie';
}

function parseSort(value: string | undefined): AdvancedDiscoverSort {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'rating_desc':
    case 'newest':
    case 'oldest':
      return normalized;
    default:
      return DEFAULT_WORLD_CINEMA_SORT;
  }
}

export function parseWorldCinemaParams(
  params: Record<string, string | string[] | undefined>,
): WorldCinemaState {
  const defaults = createDefaultWorldCinemaState();
  const mediaType = parseMediaType(readRouteParam(params.mediaType) ?? defaults.mediaType);

  return {
    mediaType,
    originCountry:
      parseOriginCountryParam(
        readRouteParam(params.originCountry),
        defaults.originCountry,
      ) ?? defaults.originCountry,
    sort: parseSort(readRouteParam(params.sort) ?? defaults.sort),
    genreIds: parseCommaSeparatedIds(params.genres),
    genreMatch: readRouteParam(params.genreMatch) === 'any' ? 'any' : 'all',
    year: parseYearParam(readRouteParam(params.year)),
    yearFrom: parseYearParam(readRouteParam(params.yearFrom)),
    yearTo: parseYearParam(readRouteParam(params.yearTo)),
    minRating: parseRatingParam(readRouteParam(params.minRating)),
    maxRating: parseRatingParam(readRouteParam(params.maxRating)),
    minVoteCount: parseVoteCountParam(readRouteParam(params.minVoteCount)),
    minRuntimeMinutes: parseRuntimeParam(readRouteParam(params.minRuntime)),
    maxRuntimeMinutes: parseRuntimeParam(readRouteParam(params.maxRuntime)),
    originalLanguage: parseLanguageCodeParam(readRouteParam(params.language)),
    keywordIds: parseCommaSeparatedIds(params.keywords ?? params.keywordId),
    tvStatuses: mediaType === 'tv' ? parseTvDiscoverStatuses(params.tvStatus ?? params.tvStatuses) : [],
  };
}

export function serializeWorldCinemaParams(
  state: WorldCinemaState,
): Record<string, string> {
  const params: Record<string, string> = {
    mediaType: state.mediaType,
    originCountry: state.originCountry,
  };

  if (state.sort !== DEFAULT_WORLD_CINEMA_SORT) {
    params.sort = state.sort;
  }

  if (state.genreIds.length > 0) {
    params.genres = state.genreIds.join(',');
  }

  if (state.genreIds.length > 1 && state.genreMatch === 'any') {
    params.genreMatch = 'any';
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

  if (state.maxRating != null) {
    params.maxRating = String(state.maxRating);
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

  if (state.keywordIds.length > 0) {
    params.keywords = state.keywordIds.join(',');
  }

  if (state.mediaType === 'tv' && state.tvStatuses.length > 0) {
    params.tvStatus = state.tvStatuses.join(',');
  }

  return params;
}

export function serializeWorldCinemaRoute(state: WorldCinemaState): string {
  const params = serializeWorldCinemaParams(state);
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `/world-cinema?${search}` : '/world-cinema';
}

export function createWorldCinemaHref(
  overrides: Partial<WorldCinemaState> = {},
): string {
  const base = createDefaultWorldCinemaState();

  return serializeWorldCinemaRoute({
    ...base,
    ...overrides,
  });
}
