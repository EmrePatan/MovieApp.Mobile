import { useQuery } from '@tanstack/react-query';
import { getInsightsV3 } from '../api/insights-api';
import { insightsV3QueryKey } from './insights-query-keys';
import { getInsightsTimeZone } from '../utils/insights-timezone';

export function useInsightsV3(year?: number) {
  const timeZone = getInsightsTimeZone();

  return useQuery({
    queryKey: insightsV3QueryKey(timeZone, year),
    queryFn: ({ signal }) => getInsightsV3(timeZone, year, signal),
    staleTime: 60_000,
  });
}
