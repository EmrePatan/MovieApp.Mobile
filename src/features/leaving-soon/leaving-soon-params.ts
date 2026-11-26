import {
  parseCommaSeparatedIds,
  parseLanguageCodeParam,
  parseOriginCountryParam,
  parseRatingParam,
  parseRuntimeParam,
  parseVoteCountParam,
  parseWatchProviderIdsParam,
  parseYearParam,
  readRouteParam,
} from '@/features/discovery/utils/parse-route-helpers';
import {
  createCatalogFilterSheetConfig,
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
  type CatalogFilterSheetConfig,
} from '@/features/discovery/utils/catalog-filter-draft';
import {
  createDefaultLeavingSoonState,
  DEFAULT_LEAVING_SOON_SORT,
  LEAVING_SOON_SORT_OPTIONS,
  type LeavingSoonSort,
  type LeavingSoonState,
} from './leaving-soon-types';

const BASE_CONFIG = createCatalogFilterSheetConfig({ supportsMyPlatforms: true });

/** The endpoint has no keyword or TV status filter. */
export const LEAVING_SOON_FILTER_SHEET_CONFIG: CatalogFilterSheetConfig = {
  ...BASE_CONFIG,
  fields: BASE_CONFIG.fields.filter((field) => field !== 'keywords' && field !== 'tvStatus'),
};

export const LEAVING_SOON_PARAM_KEYS = [
  'mediaType',
  'sort',
  'genres',
  'year',
  'yearFrom',
  'yearTo',
  'minRating',
  'minVoteCount',
  'minRuntime',
  'maxRuntime',
  'language',
  'originCountry',
  'watchProviderId',
] as const;

function parseSort(value: string | undefined): LeavingSoonSort {
  return LEAVING_SOON_SORT_OPTIONS.find((sort) => sort === value) ?? DEFAULT_LEAVING_SOON_SORT;
}

export function parseLeavingSoonParams(
  params: Record<string, string | string[] | undefined>,
): LeavingSoonState {
  const mediaType = readRouteParam(params.mediaType);

  return {
    mediaType: mediaType === 'movie' || mediaType === 'tv' ? mediaType : 'all',
    sort: parseSort(readRouteParam(params.sort)),
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
    watchProviderIds: parseWatchProviderIdsParam(params.watchProviderId),
  };
}

export function serializeLeavingSoonParams(state: LeavingSoonState): Record<string, string> {
  const defaults = createDefaultLeavingSoonState();
  const entries: [string, string | number | null][] = [
    ['mediaType', state.mediaType === defaults.mediaType ? null : state.mediaType],
    ['sort', state.sort === defaults.sort ? null : state.sort],
    ['genres', state.genreIds.join(',') || null],
    ['year', state.year],
    ['yearFrom', state.yearFrom],
    ['yearTo', state.yearTo],
    ['minRating', state.minRating],
    ['minVoteCount', state.minVoteCount],
    ['minRuntime', state.minRuntimeMinutes],
    ['maxRuntime', state.maxRuntimeMinutes],
    ['language', state.originalLanguage],
    ['originCountry', state.originCountry],
    ['watchProviderId', state.watchProviderIds.join(',') || null],
  ];

  return Object.fromEntries(
    entries.filter(([, value]) => value != null).map(([key, value]) => [key, String(value)]),
  );
}

export function serializeLeavingSoonRoute(state: LeavingSoonState): string {
  const search = new URLSearchParams(serializeLeavingSoonParams(state)).toString();
  return search.length > 0 ? `/leaving-soon?${search}` : '/leaving-soon';
}

export function leavingSoonStateToFilterDraft(state: LeavingSoonState): CatalogFilterDraft {
  const { sort: _sort, mediaType, ...filters } = state;

  return {
    ...createEmptyCatalogFilterDraft(mediaType),
    ...filters,
    contentType: mediaType,
  };
}

export function filterDraftToLeavingSoonState(
  draft: CatalogFilterDraft,
  current: LeavingSoonState,
): LeavingSoonState {
  return {
    sort: current.sort,
    mediaType: draft.contentType,
    genreIds: draft.genreIds,
    year: draft.year,
    yearFrom: draft.yearFrom,
    yearTo: draft.yearTo,
    minRating: draft.minRating,
    minVoteCount: draft.minVoteCount,
    minRuntimeMinutes: draft.minRuntimeMinutes,
    maxRuntimeMinutes: draft.maxRuntimeMinutes,
    originalLanguage: draft.originalLanguage,
    originCountry: draft.originCountry,
    watchProviderIds: draft.watchProviderIds,
  };
}
