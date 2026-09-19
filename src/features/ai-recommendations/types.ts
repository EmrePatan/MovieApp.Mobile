import type { ContentType } from '@/models/api/pagination';

export const AI_RECOMMENDATION_MIN_MESSAGE_LENGTH = 3;
export const AI_RECOMMENDATION_DAILY_LIMIT = 3;

export const AI_RECOMMENDATION_MAX_MESSAGE_LENGTH = 500;

export interface AiRecommendationRequest {
  message: string;
  sessionId: string | null;
}

export interface AiRecommendationValidationSummary {
  geminiSuggestionCount: number;
  validatedCount: number;
  rejectedCount: number;
}

export interface AiRecommendationMovieItem {
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
  runtimeMinutes: number | null;
  reason: string;
}

export interface AiRecommendationResponse {
  sessionId: string;
  isAiGenerated: boolean;
  partialResults: boolean;
  requestedCount: number;
  returnedCount: number;
  quotaRemaining: number;
  recommendations: AiRecommendationMovieItem[];
  validationSummary: AiRecommendationValidationSummary;
}

export const AI_RECOMMENDATION_SUGGESTED_PROMPT_KEYS = [
  'aiRecommendations.suggestedPrompts.cozyMystery',
  'aiRecommendations.suggestedPrompts.sciFi',
  'aiRecommendations.suggestedPrompts.comedy',
] as const;
