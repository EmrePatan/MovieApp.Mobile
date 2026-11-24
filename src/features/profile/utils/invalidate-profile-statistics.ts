import type { QueryClient } from '@tanstack/react-query';
import { profileStatisticsQueryKey } from '../hooks/profile-query-keys';

/**
 * Profile statistics and the insights tab (goals, year summary, taste) are both derived from the
 * same watch/rating/favorite data, so they refresh together.
 */
export function invalidateProfileStatistics(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: profileStatisticsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: ['insights'] });
}
