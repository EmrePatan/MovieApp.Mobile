export const DEFAULT_REVIEW_PAGE_SIZE = 10;
export const REVIEW_COUNT_PAGE_SIZE = 1;
export const MAX_REVIEW_CONTENT_LENGTH = 5000;

export type ReviewContentType = 'movie' | 'tv';

export type ReviewSortOption = 'newest' | 'oldest' | 'ratingDesc' | 'ratingAsc';

export const DEFAULT_REVIEW_SORT: ReviewSortOption = 'newest';

export interface ReviewsQueryOptions {
  page?: number;
  pageSize?: number;
  sort?: ReviewSortOption;
  ratingStars?: number | null;
}

export interface ReviewAuthorResponse {
  id: string;
  displayName: string;
}

export interface ReviewResponse {
  id: string;
  user: ReviewAuthorResponse;
  content: string;
  createdAt: string;
  updatedAt: string;
  userRating?: number | null;
}

export interface ReviewListResponse {
  items: ReviewResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateReviewRequest {
  content: string;
}

export interface UpdateReviewRequest {
  content: string;
}

export interface ReviewRatingDistributionResponse {
  averageScore: number;
  ratedReviewCount: number;
  scoreDistribution: Record<string, number>;
}
