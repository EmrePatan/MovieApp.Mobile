export const socialProfilePath = (userId: string) => `/api/social/profiles/${userId}`;
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

export const socialFeedPath = (cursor?: string | null, pageSize = 20) => {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) params.set('cursor', cursor);
  return `/api/social/feed?${params.toString()}`;
};

export const socialPendingFollowRequestsPath = (page = 1, pageSize = 20) =>
  `/api/social/follow-requests?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;

export const socialActivityLikesPath = (activityId: string) => `/api/social/activities/${activityId}/likes`;
export const socialCommentLikesPath = (commentId: string) => `/api/social/comments/${commentId}/likes`;

export const socialActivityLikePath = (activityId: string) => `/api/social/activities/${activityId}/like`;
export const socialActivityCommentsPath = (activityId: string, parentCommentId?: string | null, page = 1, pageSize = 20) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (parentCommentId) params.set('parentCommentId', parentCommentId);
  return `/api/social/activities/${activityId}/comments?${params.toString()}`;
};
export const socialCommentPath = (commentId: string) => `/api/social/comments/${commentId}`;
export const socialCommentLikePath = (commentId: string) => `${socialCommentPath(commentId)}/like`;
export const socialReportsPath = () => '/api/social/reports';

export const socialNotificationsPath = (page = 1, pageSize = 20) =>
  `/api/social/notifications?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString()}`;
export const socialUnreadNotificationCountPath = () => '/api/social/notifications/unread-count';
export const socialNotificationReadPath = (notificationId: string) => `/api/social/notifications/${notificationId}/read`;
export const socialReadAllNotificationsPath = () => '/api/social/notifications/read-all';
