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
}

export interface SocialFeedPage {
  items: SocialFeedItem[];
  nextCursor: string | null;
}
