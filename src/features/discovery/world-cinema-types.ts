import type {
  AdvancedDiscoverMediaType,
  AdvancedDiscoverSort,
  GenreMatchMode,
} from './advanced-discover-types';
import type { TvDiscoverStatus } from './tv-discover-status';

export const WORLD_CINEMA_PREVIEW_SIZE = 8;
export const DEFAULT_WORLD_CINEMA_PAGE_SIZE = 20;
export const DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY = 'KR';
export const DEFAULT_WORLD_CINEMA_MEDIA_TYPE: AdvancedDiscoverMediaType = 'movie';
export const DEFAULT_WORLD_CINEMA_SORT: AdvancedDiscoverSort = 'popularity_desc';

export interface WorldCinemaCollection {
  originCountry: string;
}

export interface WorldCinemaFilters {
  genreIds: string[];
  genreMatch: GenreMatchMode;
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number | null;
  maxRating: number | null;
  minVoteCount: number | null;
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  originalLanguage: string | null;
  keywordIds: string[];
  tvStatuses: TvDiscoverStatus[];
}

export interface WorldCinemaState extends WorldCinemaFilters {
  mediaType: AdvancedDiscoverMediaType;
  originCountry: string;
  sort: AdvancedDiscoverSort;
}

export interface WorldCinemaRequest extends WorldCinemaState {
  page?: number;
  pageSize?: number;
}

export const WORLD_CINEMA_SORT_OPTIONS: AdvancedDiscoverSort[] = [
  'popularity_desc',
  'rating_desc',
  'newest',
  'oldest',
];

export function createDefaultWorldCinemaFilters(): WorldCinemaFilters {
  return {
    genreIds: [],
    genreMatch: 'all',
    year: null,
    yearFrom: null,
    yearTo: null,
    minRating: null,
    maxRating: null,
    minVoteCount: null,
    minRuntimeMinutes: null,
    maxRuntimeMinutes: null,
    originalLanguage: null,
    keywordIds: [],
    tvStatuses: [],
  };
}

export function createDefaultWorldCinemaState(): WorldCinemaState {
  return {
    mediaType: DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
    originCountry: DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
    sort: DEFAULT_WORLD_CINEMA_SORT,
    ...createDefaultWorldCinemaFilters(),
  };
}

/** User filters only — ignores default country/media context and sort. */
export function hasActiveWorldCinemaUserFilters(state: WorldCinemaState): boolean {
  if (state.mediaType !== DEFAULT_WORLD_CINEMA_MEDIA_TYPE) {
    return true;
  }

  if (state.originCountry !== DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY) {
    return true;
  }

  if (state.genreIds.length > 0) {
    return true;
  }

  if (state.year != null || state.yearFrom != null || state.yearTo != null) {
    return true;
  }

  if (state.minRating != null || state.maxRating != null) {
    return true;
  }

  if (state.minVoteCount != null) {
    return true;
  }

  if (state.minRuntimeMinutes != null || state.maxRuntimeMinutes != null) {
    return true;
  }

  if (state.originalLanguage) {
    return true;
  }

  if (state.keywordIds.length > 0) {
    return true;
  }

  if (state.tvStatuses.length > 0) {
    return true;
  }

  return false;
}

export function hasNonDefaultWorldCinemaSort(state: WorldCinemaState): boolean {
  return state.sort !== DEFAULT_WORLD_CINEMA_SORT;
}

export function clearWorldCinemaUserFilters(state: WorldCinemaState): WorldCinemaState {
  return {
    ...createDefaultWorldCinemaState(),
    sort: state.sort,
  };
}
