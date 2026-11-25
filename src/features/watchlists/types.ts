import type { PaginationMeta } from '@/models/api/pagination';

export interface CreateWatchlistRequest {
  name: string;
  /** Omitted or null means no description. */
  description?: string | null;
}

export interface UpdateWatchlistRequest {
  name: string;
  /** Omitted or null keeps the description; an empty string clears it. */
  description?: string | null;
}

export interface WatchlistSummaryResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  description?: string | null;
  /** Newest poster paths for the list cover (up to 4). Absent on older API responses. */
  coverPosterPaths?: string[];
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

export type WatchlistContentType = 'movie' | 'tv';

export interface WatchlistCatalogItemResponse {
  contentType: WatchlistContentType;
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  firstAirDate: string | null;
  voteAverage: number;
  createdAt: string;
}

export interface WatchlistMembershipResponse {
  watchlistIds: string[];
  isInWatchlist: boolean;
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
  items: WatchlistCatalogItemResponse[];
  movies: WatchlistMovieItemResponse[];
  tvShows: WatchlistTvShowItemResponse[];
}

export const DEFAULT_WATCHLIST_PAGE_SIZE = 20;
