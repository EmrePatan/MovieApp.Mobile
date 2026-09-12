import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getProfileStatistics } from '../api/profile-api';
import { profileStatisticsQueryKey } from './profile-query-keys';

export function useProfileStatistics() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileStatisticsQueryKey(),
    queryFn: ({ signal }) => getProfileStatistics(signal),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
