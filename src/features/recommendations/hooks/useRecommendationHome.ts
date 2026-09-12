import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getRecommendationHome } from '../api/recommendations-api';
import { recommendationHomeQueryKey } from './recommendation-query-keys';

export function useRecommendationHome() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: recommendationHomeQueryKey(),
    queryFn: ({ signal }) => getRecommendationHome(signal),
    enabled: isAuthenticated,
    staleTime: 120_000,
  });
}
