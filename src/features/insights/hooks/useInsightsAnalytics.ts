import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getInsightsAnalytics } from '../api/insights-api';
import { getInsightsTimeZone } from '../utils/insights-timezone';
import { insightsAnalyticsQueryKey } from './insights-query-keys';

export function useInsightsAnalytics() {
  const { isAuthenticated } = useAuth();
  const timeZone = getInsightsTimeZone();

  return useQuery({
    queryKey: insightsAnalyticsQueryKey(timeZone),
    queryFn: ({ signal }) => getInsightsAnalytics(timeZone, signal),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
