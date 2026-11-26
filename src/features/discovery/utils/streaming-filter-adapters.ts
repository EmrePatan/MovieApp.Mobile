import type { StreamingDiscoverState } from '../streaming-discover-types';
import {
  createCatalogFilterSheetConfig,
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
} from './catalog-filter-draft';

export const STREAMING_FILTER_SHEET_CONFIG = createCatalogFilterSheetConfig();

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
    keywordLabels: state.keywordLabels ?? {},
    tvStatuses: state.mediaType === 'movie' ? [] : state.tvStatuses,
  };
}

export function filterDraftToStreamingPatch(
  draft: CatalogFilterDraft,
  current: StreamingDiscoverState,
): StreamingDiscoverState {
  const mediaType = draft.contentType;

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
    keywordLabels: draft.keywordLabels,
    tvStatuses: mediaType === 'movie' ? [] : draft.tvStatuses,
  };
}
