import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  getSocialFeed,
  getSocialComments,
  getSocialFollowers,
  getSocialFollowing,
  getSocialPrivacy,
  getSocialPendingFollowRequests,
  getSocialProfile,
  getPendingSocialFollowRequests,
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

export function useSocialPendingFollowRequests(page = 1) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'pending-follow-requests', page],
    queryFn: ({ signal }) => getSocialPendingFollowRequests(page, 20, signal),
    enabled: isAuthenticated,
    staleTime: 15_000,
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

export function useSocialFeed() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: [...socialQueryKeys.all, 'feed'],
    queryFn: ({ pageParam, signal }) => getSocialFeed(pageParam, 20, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated,
    staleTime: 20_000,
  });
}

export function usePendingSocialFollowRequests() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'follow-requests'],
    queryFn: ({ signal }) => getPendingSocialFollowRequests(1, 20, signal),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useSocialComments(activityId: string, parentCommentId?: string | null, page = 1) {
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'comments', activityId, parentCommentId ?? 'root', page],
    queryFn: ({ signal }) => getSocialComments(activityId, parentCommentId, page, 20, signal),
    enabled: activityId.length > 0,
    staleTime: 15_000,
  });
}
