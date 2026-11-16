import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  getSocialFollowers,
  getSocialFollowing,
  getSocialPrivacy,
  getSocialProfile,
  searchSocialUsers,
} from '../api/social-api';
import { socialQueryKeys } from './social-query-keys';

export function useSocialProfile(userId: string) {
  return useQuery({
    queryKey: socialQueryKeys.profile(userId),
    queryFn: ({ signal }) => getSocialProfile(userId, signal),
    enabled: userId.length > 0,
    staleTime: 30_000,
  });
}

export function useSocialUserSearch(query: string) {
  return useQuery({
    queryKey: socialQueryKeys.search(query.trim()),
    queryFn: ({ signal }) => searchSocialUsers(query.trim(), 1, 20, signal),
    enabled: query.trim().length >= 2,
    staleTime: 15_000,
  });
}

export function useSocialFollowers(userId: string, page = 1) {
  return useQuery({
    queryKey: socialQueryKeys.followers(userId, page),
    queryFn: ({ signal }) => getSocialFollowers(userId, page, 20, signal),
    enabled: userId.length > 0,
  });
}

export function useSocialFollowing(userId: string, page = 1) {
  return useQuery({
    queryKey: socialQueryKeys.following(userId, page),
    queryFn: ({ signal }) => getSocialFollowing(userId, page, 20, signal),
    enabled: userId.length > 0,
  });
}

export function useSocialPrivacy() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: socialQueryKeys.privacy(),
    queryFn: ({ signal }) => getSocialPrivacy(signal),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
