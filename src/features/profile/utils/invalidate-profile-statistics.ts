import type { QueryClient } from '@tanstack/react-query';
import { profileStatisticsQueryKey } from '../hooks/profile-query-keys';

export function invalidateProfileStatistics(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: profileStatisticsQueryKey() });
}
