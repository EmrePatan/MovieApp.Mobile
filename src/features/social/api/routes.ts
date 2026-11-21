export const socialProfilePath = (userId: string) => `/api/social/profiles/${userId}`;
export const socialProfileCoverPosterPath = () => '/api/social/profiles/me/cover-poster';
export const socialProfileCoverImagePath = () => '/api/users/me/profile-cover';
export const socialProfileStatisticsPath = (userId: string) => `/api/social/profiles/${userId}/statistics`;
export const socialProfileActivitiesPath = (userId: string, cursor?: string | null, pageSize = 20) => {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) params.set('cursor', cursor);
  return `/api/social/profiles/${userId}/activities?${params.toString()}`;
};
export const socialSearchPath = (query: string, page = 1, pageSize = 20) =>
  `/api/social/profiles/search?${new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) }).toString()}`;
export const socialFollowersPath = (userId: string, page = 1, pageSize = 20) =>
  `/api/social/profiles/${userId}/followers?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;
export const socialFollowingPath = (userId: string, page = 1, pageSize = 20) =>
  `/api/social/profiles/${userId}/following?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;
export const socialFollowPath = (userId: string) => `/api/social/follows/${userId}`;
export const socialFollowRequestPath = (followerUserId: string) => `/api/social/follow-requests/${followerUserId}`;
export const socialAcceptFollowRequestPath = (followerUserId: string) => `${socialFollowRequestPath(followerUserId)}/accept`;
export const socialBlockPath = (userId: string) => `/api/social/blocks/${userId}`;
export const socialPrivacyPath = () => '/api/social/privacy';

export const socialActivityPath = (activityId: string) => `/api/social/activities/${activityId}`;

export const socialFeedPath = (
  cursor?: string | null,
  pageSize = 20,
  mode?: 'following' | 'discover' | null,
) => {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) params.set('cursor', cursor);
  if (mode) params.set('mode', mode);
  return `/api/social/feed?${params.toString()}`;
};

export const socialPendingFollowRequestsPath = (page = 1, pageSize = 20) =>
  `/api/social/follow-requests?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;


export const socialActivityLikePath = (activityId: string) => `/api/social/activities/${activityId}/like`;
export const socialActivityCommentsPath = (activityId: string, parentCommentId?: string | null, page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (parentCommentId) params.set('parentCommentId', parentCommentId);
  return `/api/social/activities/${activityId}/comments?${params.toString()}`;
};
export const socialCommentPath = (commentId: string) => `/api/social/comments/${commentId}`;
export const socialCommentTranslationPath = (commentId: string) =>
  `${socialCommentPath(commentId)}/translation`;
export const socialCommentLikePath = (commentId: string) => `${socialCommentPath(commentId)}/like`;
export const socialReportsPath = () => '/api/social/reports';

export const socialNotificationsPath = (page = 1, pageSize = 20) =>
  `/api/social/notifications?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;
export const socialUnreadNotificationCountPath = () => '/api/social/notifications/unread-count';
export const socialNotificationReadPath = (notificationId: string) => `/api/social/notifications/${notificationId}/read`;
export const socialReadAllNotificationsPath = () => '/api/social/notifications/read-all';

export const socialBlockedUsersPath = () => '/api/social/blocks';
