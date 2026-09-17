import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getInsightsSummary } from '../api/insights-api';
import { getInsightsTimeZone } from '../utils/insights-timezone';
import { insightsSummaryQueryKey } from './insights-query-keys';

export function useInsightsSummary() {
  const { isAuthenticated } = useAuth();
  const timeZone = getInsightsTimeZone();

  return useQuery({
    queryKey: insightsSummaryQueryKey(timeZone),
    queryFn: ({ signal }) => getInsightsSummary(timeZone, signal),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
