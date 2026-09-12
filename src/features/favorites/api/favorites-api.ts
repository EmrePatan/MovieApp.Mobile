import { api } from '@/api/client';
import {
  buildAddMovieFavoritePath,
  buildAddTvFavoritePath,
  buildFavoritesPath,
  buildRemoveMovieFavoritePath,
  buildRemoveTvFavoritePath,
} from './routes';
import type { FavoritesResponse } from '../types';

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
