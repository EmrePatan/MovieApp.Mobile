import { useMutation } from '@tanstack/react-query';
import { postAiRecommendations } from '../api/ai-recommendations-api';
import type { AiRecommendationRequest } from '../types';
import { aiRecommendationsQueryKeys } from './ai-recommendations-query-keys';

export function useAiRecommendations() {
  return useMutation({
    mutationKey: aiRecommendationsQueryKeys.all,
    mutationFn: (request: AiRecommendationRequest) => postAiRecommendations(request),
  });
}
