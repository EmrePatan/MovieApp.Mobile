export type LibraryCategory = 'watching' | 'watched' | 'liked' | 'watchlist';

export interface LibraryNextEpisode {
  episodeId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string | null;
}

export interface LibraryItem {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  originalTitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  year: number | null;
  voteAverage: number | null;
  addedAt: string | null;
  watchedAt: string | null;
  lastActivityAt: string | null;
  progressPercentage: number | null;
  nextEpisode: LibraryNextEpisode | null;
  collectionStatus: LibraryCategory;
}

export interface LibraryListResponse {
  items: LibraryItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const DEFAULT_LIBRARY_PAGE_SIZE = 24;
