import { useQuery } from '@tanstack/react-query';
import { getAiRecommendationQuota } from '../api/ai-recommendations-api';

export function useAiRecommendationQuota() {
  return useQuery({
    queryKey: ['ai-recommendations', 'quota'],
    queryFn: ({ signal }) => getAiRecommendationQuota(signal),
    staleTime: 30_000,
  });
}
