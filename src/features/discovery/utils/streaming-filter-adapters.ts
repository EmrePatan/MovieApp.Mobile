import {
  DEFAULT_STREAMING_DISCOVER_MEDIA_TYPE,
  type StreamingDiscoverState,
} from '../streaming-discover-types';
import {
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
  type CatalogFilterSheetConfig,
} from './catalog-filter-draft';

export const STREAMING_FILTER_SHEET_CONFIG: CatalogFilterSheetConfig = {
  contentTypeOptions: ['movie', 'tv'],
  primaryFields: ['contentType', 'genre', 'year', 'minRating'],
  advancedFields: [
    'originalLanguage',
    'originCountry',
    'runtime',
    'minVoteCount',
    'keywords',
    'tvStatus',
  ],
  defaultContentType: DEFAULT_STREAMING_DISCOVER_MEDIA_TYPE,
};

export function streamingStateToFilterDraft(state: StreamingDiscoverState): CatalogFilterDraft {
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

export function filterDraftToStreamingPatch(
  draft: CatalogFilterDraft,
  current: StreamingDiscoverState,
): StreamingDiscoverState {
  const mediaType = draft.contentType === 'all' ? current.mediaType : draft.contentType;

  return {
    ...current,
    mediaType,
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
    keywordIds: draft.keywordIds,
    tvStatuses: mediaType === 'tv' ? draft.tvStatuses : [],
  };
}
