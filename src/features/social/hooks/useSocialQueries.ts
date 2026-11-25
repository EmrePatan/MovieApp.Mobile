import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  getSocialActivity,
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
  getSocialProfileWatchlistItems,
  getSocialProfileWatchlists,
  searchSocialUsers,
} from '../api/social-api';
import { socialQueryKeys } from './social-query-keys';

export function useSocialProfileWatchlists(userId: string, enabled = true) {
  return useQuery({
    queryKey: socialQueryKeys.profileWatchlists(userId),
    queryFn: ({ signal }) => getSocialProfileWatchlists(userId, signal),
    enabled: Boolean(userId?.length) && enabled,
    staleTime: 15_000,
  });
}

export function useSocialProfileWatchlistItems(userId: string, watchlistId: string) {
  return useQuery({
    queryKey: socialQueryKeys.profileWatchlistItems(userId, watchlistId),
    queryFn: ({ signal }) => getSocialProfileWatchlistItems(userId, watchlistId, signal),
    enabled: Boolean(userId?.length) && Boolean(watchlistId?.length),
    staleTime: 15_000,
  });
}

export function useSocialProfile(userId: string) {
  return useQuery({
    queryKey: socialQueryKeys.profile(userId),
    queryFn: ({ signal }) => getSocialProfile(userId, signal),
    enabled: Boolean(userId?.length),
    staleTime: 30_000,
  });
}

export function useSocialProfileStatistics(userId: string, enabled = true) {
  return useQuery({
    queryKey: socialQueryKeys.profileStatistics(userId),
    queryFn: ({ signal }) => getSocialProfileStatistics(userId, signal),
    enabled: Boolean(userId?.length) && enabled,
    staleTime: 15_000,
    refetchOnMount: 'always',
  });
}

export function useSocialUserActivities(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.profileActivities(userId),
    queryFn: ({ pageParam, signal }) => getSocialUserActivities(userId, pageParam, 20, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(userId?.length) && enabled,
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
    enabled: Boolean(userId?.length) && enabled,
  });
}

export function useSocialFollowing(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.following(userId),
    queryFn: ({ pageParam, signal }) => getSocialFollowing(userId, pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 1 : undefined,
    enabled: Boolean(userId?.length) && enabled,
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

export function useSocialPendingFollowRequestCount(enabled = true) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'pending-follow-requests', 'count'],
    queryFn: ({ signal }) => getSocialPendingFollowRequests(1, 50, signal),
    enabled: isAuthenticated && enabled,
    staleTime: 15_000,
    select: (requests) => requests.length,
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

export function useSocialActivity(activityId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'activity', activityId],
    queryFn: ({ signal }) => getSocialActivity(activityId, signal),
    enabled: isAuthenticated && activityId.length > 0,
    staleTime: 20_000,
  });
}

export function useSocialFeed(mode: 'following' | 'discover' = 'discover') {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: socialQueryKeys.feed(mode),
    queryFn: ({ pageParam, signal }) => getSocialFeed(pageParam, 20, mode, signal),
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

export function useSocialUnreadNotificationCount(enabled = true) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...socialQueryKeys.all, 'notifications', 'unread-count'],
    queryFn: ({ signal }) => getSocialUnreadNotificationCount(signal),
    enabled: isAuthenticated && enabled,
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
