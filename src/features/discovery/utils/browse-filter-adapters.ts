import type { DiscoveryBrowseFilters, DiscoveryTypeFilter } from '../types';
import {
  createEmptyCatalogFilterDraft,
  type CatalogFilterDraft,
  type CatalogFilterSheetConfig,
} from '../utils/catalog-filter-draft';

export const BROWSE_FILTER_SHEET_CONFIG: CatalogFilterSheetConfig = {
  contentTypeOptions: ['all', 'movie', 'tv'],
  primaryFields: ['contentType', 'genre', 'year', 'minRating'],
  advancedFields: [
    'originalLanguage',
    'originCountry',
    'runtime',
    'minVoteCount',
    'keywords',
    'tvStatus',
  ],
};

export function browseStateToFilterDraft(
  type: DiscoveryTypeFilter,
  filters: DiscoveryBrowseFilters,
): CatalogFilterDraft {
  const contentType: CatalogFilterDraft['contentType'] =
    type === 'tv' ? 'tv' : type === 'movie' ? 'movie' : 'all';

  return {
    ...createEmptyCatalogFilterDraft(contentType),
    contentType,
    genreIds: filters.genreIds,
    year: filters.year,
    yearFrom: filters.yearFrom,
    yearTo: filters.yearTo,
    minRating: filters.minRating,
    minVoteCount: filters.minVoteCount,
    minRuntimeMinutes: filters.minRuntimeMinutes,
    maxRuntimeMinutes: filters.maxRuntimeMinutes,
    originalLanguage: filters.language,
    originCountry: filters.originCountry,
    keywordIds: filters.keywordIds,
    keywordLabels: {},
    tvStatuses: contentType === 'movie' ? [] : filters.tvStatuses,
  };
}

export function filterDraftToBrowsePatch(draft: CatalogFilterDraft): {
  type: DiscoveryTypeFilter;
  filters: Partial<DiscoveryBrowseFilters>;
} {
  return {
    type: draft.contentType,
    filters: {
      genreIds: draft.genreIds,
      year: draft.year,
      yearFrom: draft.yearFrom,
      yearTo: draft.yearTo,
      minRating: draft.minRating,
      minVoteCount: draft.minVoteCount,
      minRuntimeMinutes: draft.minRuntimeMinutes,
      maxRuntimeMinutes: draft.maxRuntimeMinutes,
      language: draft.originalLanguage,
      originCountry: draft.originCountry,
      keywordIds: draft.keywordIds,
      tvStatuses: draft.contentType === 'movie' ? [] : draft.tvStatuses,
    },
  };
}
