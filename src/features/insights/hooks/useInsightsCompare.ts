import { useQuery } from '@tanstack/react-query';
import { getInsightsCompare } from '../api/insights-api';
import { insightsCompareQueryKey } from './insights-query-keys';
import { getInsightsTimeZone } from '../utils/insights-timezone';

/** Taste overlap between the signed-in user and another profile; only fetched when visible. */
export function useInsightsCompare(userId: string | undefined, enabled: boolean) {
  const timeZone = getInsightsTimeZone();

  return useQuery({
    queryKey: insightsCompareQueryKey(userId ?? '', timeZone),
    queryFn: ({ signal }) => getInsightsCompare(userId as string, timeZone, signal),
    enabled: enabled && Boolean(userId),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
