import type { PaginationMeta } from '@/models/api/pagination';

export interface CreateWatchlistRequest {
  name: string;
}

export interface WatchlistSummaryResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface WatchlistMovieItemResponse {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  createdAt: string;
}

export interface WatchlistTvShowItemResponse {
  id: string;
  title: string;
  posterPath: string | null;
  firstAirDate: string | null;
  voteAverage: number;
  createdAt: string;
}

export interface WatchlistDetailResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  movies: WatchlistMovieItemResponse[];
  tvShows: WatchlistTvShowItemResponse[];
}

export interface WatchlistItemsResponse extends PaginationMeta {
  movies: WatchlistMovieItemResponse[];
  tvShows: WatchlistTvShowItemResponse[];
}

export type WatchlistContentType = 'movie' | 'tv';

export const DEFAULT_WATCHLIST_PAGE_SIZE = 20;
