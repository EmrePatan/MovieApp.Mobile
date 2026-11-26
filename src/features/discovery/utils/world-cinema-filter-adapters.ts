import {
  DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
  type WorldCinemaState,
} from '../world-cinema-types';
import {
  createCatalogFilterSheetConfig,
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
} from './catalog-filter-draft';

export const WORLD_CINEMA_FILTER_SHEET_CONFIG = createCatalogFilterSheetConfig({
  defaultOriginCountry: DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
  supportsMyPlatforms: true,
});

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
    keywordLabels: state.keywordLabels ?? {},
    tvStatuses: state.mediaType === 'movie' ? [] : state.tvStatuses,
    watchProviderIds: state.watchProviderIds,
  };
}

export function filterDraftToWorldCinemaPatch(
  draft: CatalogFilterDraft,
  current: WorldCinemaState,
): WorldCinemaState {
  const mediaType = draft.contentType;

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
    keywordLabels: draft.keywordLabels,
    tvStatuses: mediaType === 'movie' ? [] : draft.tvStatuses,
    watchProviderIds: draft.watchProviderIds,
  };
}
