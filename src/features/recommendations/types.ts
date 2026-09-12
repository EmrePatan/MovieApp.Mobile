import type { ContentType, PaginatedResponse, SearchContentType } from '@/models/api/pagination';

export const DEFAULT_RECOMMENDATION_PAGE_SIZE = 20;

export interface RecommendationItem {
  id: string;
  type: ContentType;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  voteAverage: number;
  voteCount: number;
  year: number | null;
  score: number;
  reason: string | null;
}

export type RecommendationResponse = PaginatedResponse<RecommendationItem>;

export interface RecommendationSection {
  key: string;
  title: string;
  items: RecommendationItem[];
}

export interface RecommendationHomeResponse {
  sections: RecommendationSection[];
}

export interface RecommendationRequest {
  page?: number;
  pageSize?: number;
  type?: SearchContentType;
}

export interface SimilarContentRequest {
  page?: number;
  pageSize?: number;
}
