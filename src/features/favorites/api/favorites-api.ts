import { api } from '@/api/client';
import {
  buildAddMovieFavoritePath,
  buildAddTvFavoritePath,
  buildBatchFavoriteStatusPath,
  buildFavoritesPath,
  buildMovieFavoriteStatusPath,
  buildRemoveMovieFavoritePath,
  buildRemoveTvFavoritePath,
  buildTvFavoriteStatusPath,
} from './routes';
import type {
  BatchFavoriteStatusItemRequest,
  BatchFavoriteStatusResponse,
  FavoriteStatusResponse,
  FavoritesResponse,
} from '../types';

export async function getMovieFavoriteStatus(
  movieId: string,
  signal?: AbortSignal,
): Promise<FavoriteStatusResponse> {
  return api.get<FavoriteStatusResponse>(buildMovieFavoriteStatusPath(movieId), { signal });
}

export async function getTvFavoriteStatus(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<FavoriteStatusResponse> {
  return api.get<FavoriteStatusResponse>(buildTvFavoriteStatusPath(tvShowId), { signal });
}

export async function getBatchFavoriteStatus(
  items: BatchFavoriteStatusItemRequest[],
  signal?: AbortSignal,
): Promise<BatchFavoriteStatusResponse> {
  return api.post<BatchFavoriteStatusResponse>(buildBatchFavoriteStatusPath(), { items }, { signal });
}

export async function getFavorites(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<FavoritesResponse> {
  return api.get<FavoritesResponse>(buildFavoritesPath(page, pageSize), { signal });
}

export async function addMovieFavorite(movieId: string): Promise<void> {
  await api.post<void>(buildAddMovieFavoritePath(movieId));
}

export async function removeMovieFavorite(movieId: string): Promise<void> {
  await api.delete<void>(buildRemoveMovieFavoritePath(movieId));
}

export async function addTvFavorite(tvShowId: string): Promise<void> {
  await api.post<void>(buildAddTvFavoritePath(tvShowId));
}

export async function removeTvFavorite(tvShowId: string): Promise<void> {
  await api.delete<void>(buildRemoveTvFavoritePath(tvShowId));
}
