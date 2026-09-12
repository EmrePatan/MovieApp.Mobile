import { api } from '@/api/client';
import {
  buildEpisodeWatchStatusPath,
  buildMarkEpisodeWatchedPath,
  buildMarkMovieWatchedPath,
  buildMovieWatchStatusPath,
  buildRecentWatchHistoryPath,
  buildSeasonProgressPath,
  buildTvShowProgressPath,
  buildUnmarkEpisodeWatchedPath,
  buildUnmarkMovieWatchedPath,
  buildWatchedEpisodesPath,
  buildWatchedMoviesPath,
} from './routes';
import type {
  EpisodeWatchStatusResponse,
  MovieWatchStatusResponse,
  RecentWatchHistoryResponse,
  SeasonWatchProgressResponse,
  TvShowWatchProgressResponse,
  WatchEpisodeResponse,
  WatchMovieResponse,
  WatchedEpisodesListResponse,
  WatchedMoviesListResponse,
} from '../types';

export async function markMovieWatched(movieId: string): Promise<WatchMovieResponse> {
  return api.post<WatchMovieResponse>(buildMarkMovieWatchedPath(movieId));
}

export async function unmarkMovieWatched(movieId: string): Promise<void> {
  await api.delete<void>(buildUnmarkMovieWatchedPath(movieId));
}

export async function getMovieWatchStatus(
  movieId: string,
  signal?: AbortSignal,
): Promise<MovieWatchStatusResponse> {
  return api.get<MovieWatchStatusResponse>(buildMovieWatchStatusPath(movieId), { signal });
}

export async function getWatchedMovies(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<WatchedMoviesListResponse> {
  return api.get<WatchedMoviesListResponse>(buildWatchedMoviesPath(page, pageSize), { signal });
}

export async function markEpisodeWatched(episodeId: string): Promise<WatchEpisodeResponse> {
  return api.post<WatchEpisodeResponse>(buildMarkEpisodeWatchedPath(episodeId));
}

export async function unmarkEpisodeWatched(episodeId: string): Promise<void> {
  await api.delete<void>(buildUnmarkEpisodeWatchedPath(episodeId));
}

export async function getEpisodeWatchStatus(
  episodeId: string,
  signal?: AbortSignal,
): Promise<EpisodeWatchStatusResponse> {
  return api.get<EpisodeWatchStatusResponse>(buildEpisodeWatchStatusPath(episodeId), { signal });
}

export async function getWatchedEpisodes(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<WatchedEpisodesListResponse> {
  return api.get<WatchedEpisodesListResponse>(buildWatchedEpisodesPath(page, pageSize), { signal });
}

export async function getRecentWatchHistory(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<RecentWatchHistoryResponse> {
  return api.get<RecentWatchHistoryResponse>(buildRecentWatchHistoryPath(page, pageSize), { signal });
}

export async function getTvShowProgress(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<TvShowWatchProgressResponse> {
  return api.get<TvShowWatchProgressResponse>(buildTvShowProgressPath(tvShowId), { signal });
}

export async function getSeasonProgress(
  tvShowId: string,
  seasonNumber: number,
  signal?: AbortSignal,
): Promise<SeasonWatchProgressResponse> {
  return api.get<SeasonWatchProgressResponse>(
    buildSeasonProgressPath(tvShowId, seasonNumber),
    { signal },
  );
}
