import { api } from '@/api/client';
import { isApiError } from '@/api/errors';
import type { AiRecommendationRequest, AiRecommendationResponse } from '../types';
import { AI_RECOMMENDATIONS_PATH, AI_RECOMMENDATIONS_QUOTA_PATH } from './routes';

export interface AiRecommendationQuotaResponse {
  remaining: number;
  limit: number;
}

function isAiRecommendationResponse(value: unknown): value is AiRecommendationResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'sessionId' in value && 'recommendations' in value && 'returnedCount' in value;
}

export async function getAiRecommendationQuota(
  signal?: AbortSignal,
): Promise<AiRecommendationQuotaResponse> {
  return api.get<AiRecommendationQuotaResponse>(AI_RECOMMENDATIONS_QUOTA_PATH, { signal });
}

export async function postAiRecommendations(
  request: AiRecommendationRequest,
  signal?: AbortSignal,
): Promise<AiRecommendationResponse> {
  try {
    return await api.post<AiRecommendationResponse>(
      AI_RECOMMENDATIONS_PATH,
      {
        message: request.message,
        sessionId: request.sessionId,
      },
      { signal },
    );
  } catch (error) {
    if (isApiError(error) && error.status === 422 && isAiRecommendationResponse(error.responseBody)) {
      return error.responseBody;
    }

    throw error;
  }
}
