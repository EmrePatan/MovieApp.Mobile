import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  getSocialFeed,
  getSocialUserActivities,
  getSocialBlockedUsers,
  getSocialNotifications,
  getSocialUnreadNotificationCount,
  getSocialComments,
  getSocialFollowers,
  getSocialFollowing,
  getSocialPrivacy,
  getSocialPendingFollowRequests,
  getSocialProfile,
  getSocialProfileStatistics,
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

export function useSocialProfileStatistics(userId: string, enabled = true) {
  return useQuery({
    queryKey: socialQueryKeys.profileStatistics(userId),
    queryFn: ({ signal }) => getSocialProfileStatistics(userId, signal),
    enabled: userId.length > 0 && enabled,
    staleTime: 60_000,
  });
}

export function useSocialUserActivities(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.profileActivities(userId),
    queryFn: ({ pageParam, signal }) => getSocialUserActivities(userId, pageParam, 20, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: userId.length > 0 && enabled,
    staleTime: 20_000,
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

export function useSocialFollowers(userId: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: socialQueryKeys.followers(userId, page),
    queryFn: ({ signal }) => getSocialFollowers(userId, page, 20, signal),
    enabled: userId.length > 0 && enabled,
  });
}

export function useSocialFollowing(userId: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: socialQueryKeys.following(userId, page),
    queryFn: ({ signal }) => getSocialFollowing(userId, page, 20, signal),
    enabled: userId.length > 0 && enabled,
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

export function useSocialComments(activityId: string, parentCommentId?: string | null) {
  return useInfiniteQuery({
    queryKey: [...socialQueryKeys.all, 'comments', activityId, parentCommentId ?? 'root'],
    queryFn: ({ pageParam, signal }) => getSocialComments(activityId, parentCommentId, pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: activityId.length > 0,
    staleTime: 15_000,
  });
}

export function useSocialNotifications() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: [...socialQueryKeys.all, 'notifications'],
    queryFn: ({ pageParam, signal }) => getSocialNotifications(pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.items.length === lastPage.pageSize ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useSocialUnreadNotificationCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'],
    queryFn: ({ signal }) => getSocialUnreadNotificationCount(signal),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useSocialBlockedUsers() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'blocked-users'],
    queryFn: ({ signal }) => getSocialBlockedUsers(signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
