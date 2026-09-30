import {
  DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
  DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
  type WorldCinemaState,
} from '../world-cinema-types';
import {
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
  type CatalogFilterSheetConfig,
} from './catalog-filter-draft';

export const WORLD_CINEMA_FILTER_SHEET_CONFIG: CatalogFilterSheetConfig = {
  contentTypeOptions: ['movie', 'tv'],
  fields: [
    'contentType',
    'originCountry',
    'genre',
    'year',
    'minRating',
    'originalLanguage',
    'runtime',
    'minVoteCount',
    'keywords',
    'tvStatus',
  ],
  defaultOriginCountry: DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
  defaultContentType: DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
};

export function worldCinemaStateToFilterDraft(state: WorldCinemaState): CatalogFilterDraft {
  return {
    ...createEmptyCatalogFilterDraft(state.mediaType),
    contentType: state.mediaType,
    genreIds: state.genreIds,
    year: state.year,
    yearFrom: state.yearFrom,
    yearTo: state.yearTo,
    minRating: state.minRating,
    minVoteCount: state.minVoteCount,
    minRuntimeMinutes: state.minRuntimeMinutes,
    maxRuntimeMinutes: state.maxRuntimeMinutes,
    originalLanguage: state.originalLanguage,
    originCountry: state.originCountry,
    keywordIds: state.keywordIds,
    keywordLabels: {},
    tvStatuses: state.mediaType === 'tv' ? state.tvStatuses : [],
  };
}

export function filterDraftToWorldCinemaPatch(
  draft: CatalogFilterDraft,
  current: WorldCinemaState,
): WorldCinemaState {
  const mediaType = draft.contentType === 'all' ? current.mediaType : draft.contentType;

  return {
    ...current,
    mediaType,
    originCountry: draft.originCountry ?? DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
    genreIds: draft.genreIds,
    year: draft.year,
    yearFrom: draft.yearFrom,
    yearTo: draft.yearTo,
    minRating: draft.minRating,
    minVoteCount: draft.minVoteCount,
    minRuntimeMinutes: draft.minRuntimeMinutes,
    maxRuntimeMinutes: draft.maxRuntimeMinutes,
    originalLanguage: draft.originalLanguage,
    keywordIds: draft.keywordIds,
    tvStatuses: mediaType === 'tv' ? draft.tvStatuses : [],
  };
}
