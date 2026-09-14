import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getTvShowFollowStatus } from '../api/follow-api';
import { tvShowFollowStatusQueryKey } from './follow-query-keys';

export function useTvShowFollowStatus(tvShowId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: tvShowFollowStatusQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvShowFollowStatus(tvShowId, signal),
    enabled: isAuthenticated && tvShowId.length > 0,
    staleTime: 30_000,
  });
}
