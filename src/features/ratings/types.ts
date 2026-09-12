export interface CreateRatingRequest {
  score: number;
}

export interface RatingResponse {
  id: string;
  movieId: string | null;
  tvShowId: string | null;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummaryResponse {
  averageScore: number;
  ratingCount: number;
  scoreDistribution: Record<string, number>;
}

export type RatingContentType = 'movie' | 'tv';
