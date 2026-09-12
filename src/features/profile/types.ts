export interface UserProfileResponse {
  id: string;
  email: string;
  userName: string;
  displayName: string;
  createdAt: string;
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
  currentPassword: string;
}

export interface UserProfileAuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserProfileResponse;
}

export interface UserStatisticsResponse {
  favoriteMovieCount: number;
  favoriteTvShowCount: number;
  watchlistCount: number;
  watchlistItemCount: number;
  ratedMovieCount: number;
  ratedTvShowCount: number;
  reviewedMovieCount: number;
  reviewedTvShowCount: number;
  watchedMovieCount: number;
  watchedEpisodeCount: number;
  totalRatingCount: number;
  totalReviewCount: number;
  totalWatchedCount: number;
}
