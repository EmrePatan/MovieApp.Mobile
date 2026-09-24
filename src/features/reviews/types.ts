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
  authoringLocale?: string | null;
}

export type ReviewTranslationOutcome = 'Translated' | 'SourceMatchesTarget';

export interface ReviewTranslationResponse {
  reviewId: string;
  outcome: ReviewTranslationOutcome;
  translatedText?: string | null;
  detectedSourceLanguage?: string | null;
  targetLocale: string;
}

export interface ReviewListResponse {
  items: ReviewResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  /** Persisted 1-10 scores of users who wrote a review. Same keys as rating summary. */
  reviewScoreDistribution?: Record<string, number>;
}

export interface CreateReviewRequest {
  content: string;
}

export interface UpdateReviewRequest {
  content: string;
}
