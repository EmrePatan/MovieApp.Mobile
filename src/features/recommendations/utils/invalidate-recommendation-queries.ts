import type { QueryClient } from '@tanstack/react-query';

export function invalidateRecommendationQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
  void queryClient.invalidateQueries({ queryKey: ['home'] });
}
