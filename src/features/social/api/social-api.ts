import { api } from '@/api/client';
import {
  socialAcceptFollowRequestPath,
  socialBlockPath,
  socialFollowersPath,
  socialFollowPath,
  socialFeedPath,
  socialActivityLikePath,
  socialActivityCommentsPath,
  socialCommentPath,
  socialCommentLikePath,
  socialReportsPath,
  socialActivityLikesPath,
  socialCommentLikesPath,
  socialFollowRequestPath,
  socialFollowingPath,
  socialPrivacyPath,
  socialPendingFollowRequestsPath,
  socialProfilePath,
  socialPendingFollowRequestsPath,
  socialSearchPath,
} from './routes';
import type {
  SocialCommentPage,
  SocialFeedPage,
  SocialLikeResult,
  SocialFollowRequest,
  SocialFollowResult,
  SocialPrivacySettings,
  SocialProfile,
  SocialFollowRequest,
  SocialUserSummary,
} from '../types';

export function getSocialProfile(userId: string, signal?: AbortSignal) {
  return api.get<SocialProfile>(socialProfilePath(userId), { signal });
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

export function likeSocialActivity(activityId: string) {
  return api.post<SocialLikeResult>(socialActivityLikesPath(activityId));
}

export function unlikeSocialActivity(activityId: string) {
  return api.delete<SocialLikeResult>(socialActivityLikesPath(activityId));
}

export function likeSocialComment(commentId: string) {
  return api.post<SocialLikeResult>(socialCommentLikesPath(commentId));
}

export function unlikeSocialComment(commentId: string) {
  return api.delete<SocialLikeResult>(socialCommentLikesPath(commentId));
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
