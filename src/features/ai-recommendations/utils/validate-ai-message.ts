import { i18n } from '@/i18n';
import {
  AI_RECOMMENDATION_MAX_MESSAGE_LENGTH,
  AI_RECOMMENDATION_MIN_MESSAGE_LENGTH,
} from '../types';

export function validateAiRecommendationMessage(message: string): string | null {
  const trimmed = message.trim();

  if (trimmed.length < AI_RECOMMENDATION_MIN_MESSAGE_LENGTH) {
    return i18n.t('aiRecommendations.validationMinLength', {
      count: AI_RECOMMENDATION_MIN_MESSAGE_LENGTH,
    });
  }

  if (trimmed.length > AI_RECOMMENDATION_MAX_MESSAGE_LENGTH) {
    return i18n.t('aiRecommendations.validationMaxLength', {
      count: AI_RECOMMENDATION_MAX_MESSAGE_LENGTH,
    });
  }

  return null;
}
