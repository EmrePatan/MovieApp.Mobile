import type { CatalogContentType } from '@/features/discovery/utils/catalog-filter-draft';
import type { PaginatedResponse } from '@/models/api/pagination';

export const DEFAULT_LEAVING_SOON_PAGE_SIZE = 20;
/** The server returns an empty list for a region with fewer titles than this. */
export const LEAVING_SOON_RAIL_MINIMUM = 5;

export const LEAVING_SOON_SORT_OPTIONS = [
  'leaving_asc',
  'rating_desc',
  'rating_asc',
  'release_desc',
  'release_asc',
  'title_asc',
  'title_desc',
] as const;

export type LeavingSoonSort = (typeof LEAVING_SOON_SORT_OPTIONS)[number];

export const DEFAULT_LEAVING_SOON_SORT: LeavingSoonSort = 'leaving_asc';

export interface LeavingSoonPlatform {
  serviceId: string;
  name: string;
  leavesAtUtc: string;
  watchLink: string | null;
}

export interface LeavingSoonItem {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  year: number | null;
  genres?: string[];
  leavesAtUtc: string;
  platforms: LeavingSoonPlatform[];
}

export type LeavingSoonResponse = PaginatedResponse<LeavingSoonItem>;

export interface LeavingSoonState {
  mediaType: CatalogContentType;
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
  watchProviderIds: number[];
  sort: LeavingSoonSort;
}

export interface LeavingSoonRequest extends Partial<LeavingSoonState> {
  watchRegion: string;
  page?: number;
  pageSize?: number;
}

export function createDefaultLeavingSoonState(): LeavingSoonState {
  return {
    mediaType: 'all',
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
    watchProviderIds: [],
    sort: DEFAULT_LEAVING_SOON_SORT,
  };
}

export function hasActiveLeavingSoonFilters(state: LeavingSoonState): boolean {
  const defaults = createDefaultLeavingSoonState();

  return (Object.keys(defaults) as (keyof LeavingSoonState)[]).some((key) => {
    if (key === 'sort') {
      return false;
    }

    const value = state[key];
    return Array.isArray(value) ? value.length > 0 : value !== defaults[key];
  });
}

export function clearLeavingSoonFilters(state: LeavingSoonState): LeavingSoonState {
  return { ...createDefaultLeavingSoonState(), sort: state.sort };
}
