import type { TvDiscoverStatus } from '../tv-discover-status';

export type CatalogContentType = 'all' | 'movie' | 'tv';

export interface CatalogFilterDraft {
  contentType: CatalogContentType;
  genreIds: string[];
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  minVoteCount: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
  keywordIds: string[];
  keywordLabels: Record<string, string>;
  tvStatuses: TvDiscoverStatus[];
}

export type CatalogFilterField =
  | 'contentType'
  | 'genre'
  | 'year'
  | 'minRating'
  | 'originalLanguage'
  | 'originCountry'
  | 'runtime'
  | 'minVoteCount'
  | 'keywords'
  | 'tvStatus';

export interface CatalogFilterSheetConfig {
  contentTypeOptions: CatalogContentType[];
  primaryFields: CatalogFilterField[];
  advancedFields: CatalogFilterField[];
  /** When set, origin country matching this value is treated as context (not "active advanced"). */
  defaultOriginCountry?: string | null;
  defaultContentType?: CatalogContentType;
}

export function createEmptyCatalogFilterDraft(
  contentType: CatalogContentType = 'all',
): CatalogFilterDraft {
  return {
    contentType,
    genreIds: [],
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    minVoteCount: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    originalLanguage: null,
    originCountry: null,
    keywordIds: [],
    keywordLabels: {},
    tvStatuses: [],
  };
}

export function clearTvStatusesIfNeeded(draft: CatalogFilterDraft): CatalogFilterDraft {
  if (draft.contentType === 'movie') {
    return { ...draft, tvStatuses: [] };
  }

  return draft;
}

export function shouldShowTvStatus(contentType: CatalogContentType): boolean {
  return contentType === 'tv' || contentType === 'all';
}

export function hasAdvancedCatalogFiltersActive(
  draft: CatalogFilterDraft,
  advancedFields: CatalogFilterField[],
  config?: Pick<CatalogFilterSheetConfig, 'defaultOriginCountry'>,
): boolean {
  for (const field of advancedFields) {
    switch (field) {
      case 'originalLanguage':
        if (draft.originalLanguage) {
          return true;
        }
        break;
      case 'originCountry':
        if (
          draft.originCountry &&
          draft.originCountry !== (config?.defaultOriginCountry ?? null)
        ) {
          return true;
        }
        break;
      case 'runtime':
        if (draft.minRuntimeMinutes != null || draft.maxRuntimeMinutes != null) {
          return true;
        }
        break;
      case 'minVoteCount':
        if (draft.minVoteCount != null) {
          return true;
        }
        break;
      case 'keywords':
        if (draft.keywordIds.length > 0) {
          return true;
        }
        break;
      case 'tvStatus':
        if (draft.tvStatuses.length > 0) {
          return true;
        }
        break;
      default:
        break;
    }
  }

  return false;
}
