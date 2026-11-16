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
