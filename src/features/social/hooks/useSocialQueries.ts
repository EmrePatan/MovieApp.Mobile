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
  const normalizedQuery = query.trim();
  return useInfiniteQuery({
    queryKey: socialQueryKeys.search(normalizedQuery),
    queryFn: ({ pageParam, signal }) => searchSocialUsers(normalizedQuery, pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
    enabled: normalizedQuery.length >= 2,
    staleTime: 15_000,
  });
}

export function useSocialFollowers(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.followers(userId),
    queryFn: ({ pageParam, signal }) => getSocialFollowers(userId, pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
    enabled: userId.length > 0 && enabled,
  });
}

export function useSocialFollowing(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.following(userId),
    queryFn: ({ pageParam, signal }) => getSocialFollowing(userId, pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
    enabled: userId.length > 0 && enabled,
  });
}

export function useSocialPendingFollowRequests() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: [...socialQueryKeys.all, 'pending-follow-requests'],
    queryFn: ({ pageParam, signal }) => getSocialPendingFollowRequests(pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
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
