export const DEFAULT_WATCH_HISTORY_PAGE_SIZE = 20;

export interface WatchMovieResponse {
  movieId: string;
  watchedAt: string;
}

export interface WatchEpisodeResponse {
  episodeId: string;
  watchedAt: string;
}

export interface MovieWatchStatusResponse {
  movieId: string;
  isWatched: boolean;
  watchedAt: string | null;
}

export interface EpisodeWatchStatusResponse {
  episodeId: string;
  isWatched: boolean;
  watchedAt: string | null;
}

export interface WatchedMovieResponse {
  movieId: string;
  title: string;
  watchedAt: string;
}

export interface WatchedMoviesListResponse {
  items: WatchedMovieResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WatchedEpisodeResponse {
  episodeId: string;
  tvShowId: string;
  seasonId: string;
  tvShowTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string | null;
  watchedAt: string;
}

export interface WatchedEpisodesListResponse {
  items: WatchedEpisodeResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type RecentWatchHistoryItemType = 'movie' | 'episode';

export interface RecentWatchHistoryItemResponse {
  type: RecentWatchHistoryItemType;
  movieId: string | null;
  episodeId: string | null;
  tvShowId: string | null;
  title: string | null;
  tvShowTitle: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  watchedAt: string;
}

export interface RecentWatchHistoryResponse {
  items: RecentWatchHistoryItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NextEpisodeResponse {
  episodeId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string | null;
}

export interface SeasonNextEpisodeResponse {
  episodeId: string;
  episodeNumber: number;
  title: string | null;
}

export interface TvShowSeasonProgressResponse {
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  progressPercentage: number;
}

export interface TvShowWatchProgressResponse {
  tvShowId: string;
  totalEpisodes: number;
  watchedEpisodes: number;
  progressPercentage: number;
  nextEpisode: NextEpisodeResponse | null;
  seasons: TvShowSeasonProgressResponse[];
}

export interface SeasonWatchProgressResponse {
  tvShowId: string;
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  progressPercentage: number;
  nextEpisode: SeasonNextEpisodeResponse | null;
}

export interface SeasonWatchedEpisodesResponse {
  tvShowId: string;
  seasonNumber: number;
  watchedEpisodeIds: string[];
}

export interface BulkUpdateEpisodeWatchStateRequest {
  episodeIds: string[];
  watched: boolean;
}

export interface BulkUpdateEpisodeWatchStateResponse {
  affectedCount: number;
  watchedAt: string | null;
}

export interface MarkThroughEpisodeResponse {
  episodeId: string;
  affectedCount: number;
  watchedAt: string;
}
