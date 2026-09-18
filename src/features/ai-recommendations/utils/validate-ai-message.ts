import {
  AI_RECOMMENDATION_MAX_MESSAGE_LENGTH,
  AI_RECOMMENDATION_MIN_MESSAGE_LENGTH,
} from '../types';

export function validateAiRecommendationMessage(message: string): string | null {
  const trimmed = message.trim();

  if (trimmed.length < AI_RECOMMENDATION_MIN_MESSAGE_LENGTH) {
    return `Describe what you want in at least ${AI_RECOMMENDATION_MIN_MESSAGE_LENGTH} characters.`;
  }

  if (trimmed.length > AI_RECOMMENDATION_MAX_MESSAGE_LENGTH) {
    return `Keep your request under ${AI_RECOMMENDATION_MAX_MESSAGE_LENGTH} characters.`;
  }

  return null;
}
