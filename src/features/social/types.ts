import type { ProfileSocialLinks } from '@/features/profile/types';

export type SocialFollowStatus = 'None' | 'Pending' | 'Accepted' | 'Self';

export interface SocialRecentAchievement {
  id: string;
  category: string;
  /** 1..5 */
  tier: number;
  targetValue: number;
  achievedAt: string;
}

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
  /** The profile's owner follows the viewer (accepted). */
  followsViewer?: boolean;
  /** Total achievement points, null/absent when the viewer may not see this member's activity. */
  achievementPoints?: number | null;
  /** Newest unlocked achievement tiers (up to 5), absent when the viewer may not see them. */
  recentAchievements?: SocialRecentAchievement[] | null;
  coverPosterPath?: string | null;
  coverImageUrl?: string | null;
  /** Optional until backend ships. */
  bio?: string | null;
  socialLinks?: ProfileSocialLinks | null;
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
  targetOriginalTitle?: string | null;
  targetSubtitle: string | null;
  posterPath: string | null;
  ratingScore: number | null;
  reviewExcerpt: string | null;
  reviewId?: string | null;
  reviewAuthoringLocale?: string | null;
  reviewUpdatedAt?: string | null;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  catalogNavigationId?: string | null;
  catalogNavigationType?: 'movie' | 'tv' | 'episode' | null;
  catalogSeasonNumber?: number | null;
  catalogEpisodeNumber?: number | null;
  highlightComment?: SocialComment | null;
  highlightCommentParentContent?: string | null;
  highlightCommentParentDisplayName?: string | null;
  highlightCommentAuthorRatingScore?: number | null;
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
  authoringLocale?: string | null;
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
  hasMore: boolean;
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
  /** Parent of `commentId` when the notification points at a reply. */
  parentCommentId?: string | null;
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

export interface SocialProfileMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string | null;
}

export interface SocialProfileShelfItem {
  id: string;
  title: string;
  posterPath: string | null;
  contentType: 'Movie' | 'TvShow';
  progressPercentage?: number | null;
}

export interface SocialProfileStatistics {
  moviesWatched: number;
  episodesWatched: number;
  ratingsCount: number;
  reviewsCount: number;
  favoritesCount: number;
  milestones: SocialProfileMilestone[];
  movieRuntimeMinutes?: number;
  episodeRuntimeMinutes?: number;
  favoriteMovies?: SocialProfileShelfItem[];
  favoriteShows?: SocialProfileShelfItem[];
  libraryTitles?: SocialProfileShelfItem[];
  watchingTitles?: SocialProfileShelfItem[];
  watchedTitles?: SocialProfileShelfItem[];
  likedTitles?: SocialProfileShelfItem[];
  watchlistTitles?: SocialProfileShelfItem[];
}
