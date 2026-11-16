export type SocialFollowStatus = 'None' | 'Pending' | 'Accepted' | 'Self';

export interface SocialProfile {
  id: string;
  userName: string;
  displayName: string;
  createdAt: string;
  avatarUrl: string | null;
  isPrivate: boolean;
  followStatus: SocialFollowStatus;
  followersCount: number;
  followingCount: number;
}

export interface SocialUserSummary {
  id: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  followStatus: SocialFollowStatus;
}

export interface SocialFollowResult {
  userId: string;
  status: SocialFollowStatus;
  isFollowing: boolean;
}

export interface SocialPrivacySettings {
  isPrivate: boolean;
  showWatched: boolean;
  showRatings: boolean;
  showFavorites: boolean;
  showReviews: boolean;
}

export interface SocialPageRequest {
  page?: number;
  pageSize?: number;
}

export interface SocialFeedItem {
  id: string;
  actorId: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  activityType: string;
  createdAt: string;
  targetContentId: string;
  targetContentType: 'Movie' | 'TvShow' | 'Episode';
  targetTitle: string;
  targetSubtitle: string | null;
  posterPath: string | null;
  ratingScore: number | null;
  reviewExcerpt: string | null;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
}

export interface SocialFeedPage {
  items: SocialFeedItem[];
  nextCursor: string | null;
}

export interface SocialFollowRequest {
  userId: string;
  userName: string;
  displayName: string;
  requestedAt: string;
}

export interface SocialLikeResult {
  isLiked: boolean;
  likeCount: number;
}

export interface SocialComment {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  likesCount: number;
  repliesCount: number;
  isLikedByMe: boolean;
}

export interface SocialCommentPage {
  items: SocialComment[];
  page: number;
  pageSize: number;
}

export interface SocialNotificationItem {
  id: string;
  notificationType: string;
  actorId: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  activityId: string | null;
  commentId: string | null;
  followId: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface SocialNotificationPage {
  items: SocialNotificationItem[];
  page: number;
  pageSize: number;
  unreadCount: number;
}

export interface SocialBlockedUser {
  userId: string;
  userName: string;
  displayName: string;
  blockedAt: string;
}
