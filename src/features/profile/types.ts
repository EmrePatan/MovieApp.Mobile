import type { SocialAuthProvider } from '@/models/api/auth';

export interface UserProfileResponse {
  id: string;
  email: string;
  userName: string;
  displayName: string;
  createdAt: string;
  hasPassword: boolean;
  linkedProviders: SocialAuthProvider[];
}

export interface UpdateProfileRequest {
  displayName: string;
}

export interface ChangeEmailRequest {
  email: string;
  currentPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  currentPassword?: string;
  provider?: SocialAuthProvider;
  identityToken?: string;
}

export interface UserProfileAuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserProfileResponse;
}

export interface UserStatisticsSummaryResponse {
  moviesWatched: number;
  episodesWatched: number;
  showsStarted: number;
  showsCompleted: number;
  ratingsCount: number;
  reviewsCount: number;
  favoritesCount: number;
  watchlistCount: number;
  averageStarRating: number | null;
}

export interface MonthlyActivityResponse {
  year: number;
  month: number;
  movies: number;
  episodes: number;
  total: number;
}

export interface ActivityMonthHighlightResponse {
  year: number;
  month: number;
  movies: number;
  episodes: number;
  total: number;
}

export interface UserStatisticsActivityResponse {
  last12Months: MonthlyActivityResponse[];
  mostActiveMonth: ActivityMonthHighlightResponse | null;
  currentMonthTotal: number;
  previousMonthTotal: number;
  longestStreakDays: number | null;
}

export interface GenreStatisticResponse {
  genreId: string;
  name: string;
  count: number;
}

export interface StarRatingDistributionResponse {
  stars: number;
  count: number;
}

export interface UserStatisticsRatingsResponse {
  distribution: StarRatingDistributionResponse[];
  mostUsedStars: number | null;
  averageStarRating: number | null;
}

export interface UserStatisticsWatchingMixResponse {
  movieTitleCount: number;
  seriesTitleCount: number;
}

export interface ProfileMilestoneResponse {
  id: string;
  title: string;
  description: string;
  achievedAt: string | null;
}

export interface UserStatisticsResponse {
  summary: UserStatisticsSummaryResponse;
  activity: UserStatisticsActivityResponse;
  genres: GenreStatisticResponse[];
  ratings: UserStatisticsRatingsResponse;
  watchingMix: UserStatisticsWatchingMixResponse;
  milestones: ProfileMilestoneResponse[];
  insights: string[];
}
