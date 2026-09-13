import { api } from '@/api/client';
import {
  buildAddMovieToWatchlistPath,
  buildAddTvToWatchlistPath,
  buildRemoveMovieFromWatchlistPath,
  buildRemoveTvFromWatchlistPath,
  buildWatchlistItemsPath,
  buildWatchlistMembershipPath,
  buildWatchlistPath,
  buildWatchlistsPath,
} from './routes';
import type {
  CreateWatchlistRequest,
  WatchlistDetailResponse,
  WatchlistItemsResponse,
  WatchlistMembershipResponse,
  WatchlistSummaryResponse,
} from '../types';
import type { WatchlistContentType } from '../types';

export async function getWatchlistMembership(
  contentType: WatchlistContentType,
  contentId: string,
  signal?: AbortSignal,
): Promise<WatchlistMembershipResponse> {
  return api.get<WatchlistMembershipResponse>(
    buildWatchlistMembershipPath(contentType, contentId),
    { signal },
  );
}

export async function getWatchlists(signal?: AbortSignal): Promise<WatchlistSummaryResponse[]> {
  return api.get<WatchlistSummaryResponse[]>(buildWatchlistsPath(), { signal });
}

export async function createWatchlist(name: string): Promise<WatchlistSummaryResponse> {
  const body: CreateWatchlistRequest = { name };
  return api.post<WatchlistSummaryResponse>(buildWatchlistsPath(), body);
}

export async function getWatchlist(
  watchlistId: string,
  signal?: AbortSignal,
): Promise<WatchlistDetailResponse> {
  return api.get<WatchlistDetailResponse>(buildWatchlistPath(watchlistId), { signal });
}

export async function deleteWatchlist(watchlistId: string): Promise<void> {
  await api.delete<void>(buildWatchlistPath(watchlistId));
}

export async function addMovieToWatchlist(
  watchlistId: string,
  movieId: string,
): Promise<void> {
  await api.post<void>(buildAddMovieToWatchlistPath(watchlistId, movieId));
}

export async function removeMovieFromWatchlist(
  watchlistId: string,
  movieId: string,
): Promise<void> {
  await api.delete<void>(buildRemoveMovieFromWatchlistPath(watchlistId, movieId));
}

export async function addTvToWatchlist(
  watchlistId: string,
  tvShowId: string,
): Promise<void> {
  await api.post<void>(buildAddTvToWatchlistPath(watchlistId, tvShowId));
}

export async function removeTvFromWatchlist(
  watchlistId: string,
  tvShowId: string,
): Promise<void> {
  await api.delete<void>(buildRemoveTvFromWatchlistPath(watchlistId, tvShowId));
}

export async function getWatchlistItems(
  watchlistId: string,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<WatchlistItemsResponse> {
  return api.get<WatchlistItemsResponse>(
    buildWatchlistItemsPath(watchlistId, page, pageSize),
    { signal },
  );
}
