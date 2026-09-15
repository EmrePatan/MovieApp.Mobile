import { api } from '@/api/client';
import type { GalleryResponse } from '../types';
import { normalizeGalleryResponse } from './normalize-gallery-response';
import {
  buildMovieGalleryPath,
  buildPersonGalleryPath,
  buildTvShowGalleryPath,
} from './routes';

export async function getMovieGallery(
  movieId: string,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  const response = await api.get<unknown>(buildMovieGalleryPath(movieId), {
    authenticated: false,
    signal,
  });

  return normalizeGalleryResponse(response);
}

export async function getTvShowGallery(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  const response = await api.get<unknown>(buildTvShowGalleryPath(tvShowId), {
    authenticated: false,
    signal,
  });

  return normalizeGalleryResponse(response);
}

export async function getPersonGallery(
  tmdbPersonId: number,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  const response = await api.get<unknown>(buildPersonGalleryPath(tmdbPersonId), {
    authenticated: false,
    signal,
  });

  return normalizeGalleryResponse(response);
}
