import type { AdvancedDiscoverMediaType, AdvancedDiscoverSort } from './advanced-discover-types';

export const WORLD_CINEMA_PREVIEW_SIZE = 8;
export const DEFAULT_WORLD_CINEMA_PAGE_SIZE = 20;
export const DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY = 'KR';
export const DEFAULT_WORLD_CINEMA_MEDIA_TYPE: AdvancedDiscoverMediaType = 'movie';
export const DEFAULT_WORLD_CINEMA_SORT: AdvancedDiscoverSort = 'popularity_desc';

export interface WorldCinemaCollection {
  originCountry: string;
}

export interface WorldCinemaState {
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
];

export function createDefaultWorldCinemaState(): WorldCinemaState {
  return {
    mediaType: DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
    originCountry: DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
    sort: DEFAULT_WORLD_CINEMA_SORT,
  };
}
