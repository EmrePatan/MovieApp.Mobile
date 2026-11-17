import { api } from '@/api/client';
import {
  socialAcceptFollowRequestPath,
  socialBlockPath,
  socialBlockedUsersPath,
  socialFollowersPath,
  socialFollowPath,
  socialFeedPath,
  socialActivityLikePath,
  socialActivityCommentsPath,
  socialCommentPath,
  socialCommentLikePath,
  socialReportsPath,
  socialNotificationsPath,
  socialUnreadNotificationCountPath,
  socialNotificationReadPath,
  socialReadAllNotificationsPath,
  socialFollowRequestPath,
  socialFollowingPath,
  socialPrivacyPath,
  socialPendingFollowRequestsPath,
  socialProfilePath,
  socialProfileStatisticsPath,
  socialProfileActivitiesPath,
  socialSearchPath,
} from './routes';
import type {
  SocialCommentPage,
  SocialBlockedUser,
  SocialNotificationPage,
  SocialFeedPage,
  SocialFollowRequest,
  SocialFollowResult,
  SocialPrivacySettings,
  SocialProfile,
  SocialProfileStatistics,
  SocialUserSummary,
} from '../types';

export function getSocialProfile(userId: string, signal?: AbortSignal) {
  return api.get<SocialProfile>(socialProfilePath(userId), { signal });
}

export function getSocialProfileStatistics(userId: string, signal?: AbortSignal) {
  return api.get<SocialProfileStatistics>(socialProfileStatisticsPath(userId), { signal });
}

export function getSocialUserActivities(userId: string, cursor?: string | null, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialFeedPage>(socialProfileActivitiesPath(userId, cursor, pageSize), { signal });
}

export function searchSocialUsers(query: string, page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialUserSummary[]>(socialSearchPath(query, page, pageSize), { signal });
}

export function getSocialFollowers(userId: string, page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialUserSummary[]>(socialFollowersPath(userId, page, pageSize), { signal });
}

export function getSocialFollowing(userId: string, page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialUserSummary[]>(socialFollowingPath(userId, page, pageSize), { signal });
}

export function followSocialUser(userId: string) {
  return api.post<SocialFollowResult>(socialFollowPath(userId));
}

export function unfollowSocialUser(userId: string) {
  return api.delete<void>(socialFollowPath(userId));
}

export function getSocialPendingFollowRequests(page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialFollowRequest[]>(
    socialPendingFollowRequestsPath(page, pageSize),
    { signal },
  );
}

export function acceptSocialFollowRequest(followerUserId: string) {
  return api.post<SocialFollowResult>(socialAcceptFollowRequestPath(followerUserId));
}

export function rejectSocialFollowRequest(followerUserId: string) {
  return api.delete<void>(socialFollowRequestPath(followerUserId));
}

export function blockSocialUser(userId: string) {
  return api.post<void>(socialBlockPath(userId));
}

export function unblockSocialUser(userId: string) {
  return api.delete<void>(socialBlockPath(userId));
}

export function getSocialPrivacy(signal?: AbortSignal) {
  return api.get<SocialPrivacySettings>(socialPrivacyPath(), { signal });
}

export function updateSocialPrivacy(settings: SocialPrivacySettings) {
  return api.put<SocialPrivacySettings>(socialPrivacyPath(), settings);
}

export function getSocialFeed(cursor?: string | null, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialFeedPage>(socialFeedPath(cursor, pageSize), { signal });
}

export function getPendingSocialFollowRequests(page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialFollowRequest[]>(socialPendingFollowRequestsPath(page, pageSize), { signal });
}

export function getSocialComments(activityId: string, parentCommentId?: string | null, page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialCommentPage>(socialActivityCommentsPath(activityId, parentCommentId, page, pageSize), { signal });
}

export function createSocialComment(activityId: string, content: string, parentCommentId?: string | null) {
  return api.post<import('../types').SocialComment>(socialActivityCommentsPath(activityId).split('?')[0], { content, parentCommentId });
}

export function likeSocialActivity(activityId: string) {
  return api.post<void>(socialActivityLikePath(activityId));
}

export function unlikeSocialActivity(activityId: string) {
  return api.delete<void>(socialActivityLikePath(activityId));
}

export function deleteSocialComment(commentId: string) {
  return api.delete<void>(socialCommentPath(commentId));
}

export function likeSocialComment(commentId: string) {
  return api.post<void>(socialCommentLikePath(commentId));
}

export function unlikeSocialComment(commentId: string) {
  return api.delete<void>(socialCommentLikePath(commentId));
}

export function reportSocialContent(payload: { targetType: 'Activity' | 'Comment' | 'User'; targetId: string; reason: string; details?: string | null }) {
  return api.post<void>(socialReportsPath(), payload);
}

export function getSocialNotifications(page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<SocialNotificationPage>(socialNotificationsPath(page, pageSize), { signal });
}

export function getSocialUnreadNotificationCount(signal?: AbortSignal) {
  return api.get<number>(socialUnreadNotificationCountPath(), { signal });
}

export function markSocialNotificationRead(notificationId: string) {
  return api.patch<void>(socialNotificationReadPath(notificationId));
}

export function markAllSocialNotificationsRead() {
  return api.patch<number>(socialReadAllNotificationsPath());
}

export function getSocialBlockedUsers(signal?: AbortSignal) {
  return api.get<SocialBlockedUser[]>(socialBlockedUsersPath(), { signal });
}
