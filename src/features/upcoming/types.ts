import type { ContentType, PaginatedResponse } from '@/models/api/pagination';

export type UpcomingKind = 'MovieRelease' | 'TvShowPremiere' | 'TvEpisode';

export interface UpcomingCatalogItem {
  id: string;
  type: ContentType;
  upcomingKind: UpcomingKind;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  year: number | null;
  isFollowed: boolean;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string | null;
}

export interface UpcomingCatalogItemResponse {
  contentId: string;
  contentType: 'Movie' | 'Tv';
  upcomingKind: UpcomingKind;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  isFollowed: boolean;
  episodeId?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeName?: string | null;
}

export type UpcomingCatalogResponse = PaginatedResponse<UpcomingCatalogItemResponse>;

export type UpcomingCatalogScope = 'catalog' | 'followed';

export interface UpcomingCatalogRequest {
  page?: number;
  pageSize?: number;
  scope?: UpcomingCatalogScope;
  releaseRegion?: string;
}

export const DEFAULT_UPCOMING_PAGE_SIZE = 20;
