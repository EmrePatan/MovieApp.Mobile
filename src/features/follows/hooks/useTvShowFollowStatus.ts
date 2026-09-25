import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getTvShowFollowStatus } from '../api/follow-api';
import { tvShowFollowStatusQueryKey } from './follow-query-keys';

interface UseTvShowFollowStatusOptions {
  enabled?: boolean;
}

export function useTvShowFollowStatus(
  tvShowId: string,
  options?: UseTvShowFollowStatusOptions,
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: tvShowFollowStatusQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvShowFollowStatus(tvShowId, signal),
    enabled:
      isAuthenticated && tvShowId.length > 0 && (options?.enabled ?? true),
    staleTime: 30_000,
  });
}
