import { api } from '@/api/client';
import {
  socialAcceptFollowRequestPath,
  socialBlockPath,
  socialFollowersPath,
  socialFollowPath,
  socialFeedPath,
  socialFollowRequestPath,
  socialFollowingPath,
  socialPrivacyPath,
  socialPendingFollowRequestsPath,
  socialProfilePath,
  socialPendingFollowRequestsPath,
  socialSearchPath,
} from './routes';
import type {
  SocialFeedPage,
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
