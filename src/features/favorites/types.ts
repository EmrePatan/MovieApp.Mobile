import type { PaginationMeta } from '@/models/api/pagination';

export interface FavoriteMovieItemResponse {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
}

export interface FavoriteTvShowItemResponse {
  id: string;
  title: string;
  posterPath: string | null;
  firstAirDate: string | null;
  voteAverage: number;
}

export interface FavoritesResponse extends PaginationMeta {
  movies: FavoriteMovieItemResponse[];
  tvShows: FavoriteTvShowItemResponse[];
}

export interface FavoriteStatusResponse {
  isFavorited: boolean;
}

export type FavoriteContentType = 'movie' | 'tv';

export const DEFAULT_FAVORITES_PAGE_SIZE = 20;
