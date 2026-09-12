import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getCurrentProfile } from '../api/profile-api';
import { currentProfileQueryKey } from './profile-query-keys';

export function useCurrentProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: currentProfileQueryKey(),
    queryFn: ({ signal }) => getCurrentProfile(signal),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
