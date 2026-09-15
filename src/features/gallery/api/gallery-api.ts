import { api } from '@/api/client';
import type { GalleryResponse } from '../types';
import {
  buildMovieGalleryPath,
  buildPersonGalleryPath,
  buildTvShowGalleryPath,
} from './routes';

export async function getMovieGallery(
  movieId: string,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  return api.get<GalleryResponse>(buildMovieGalleryPath(movieId), {
    authenticated: false,
    signal,
  });
}

export async function getTvShowGallery(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  return api.get<GalleryResponse>(buildTvShowGalleryPath(tvShowId), {
    authenticated: false,
    signal,
  });
}

export async function getPersonGallery(
  tmdbPersonId: number,
  signal?: AbortSignal,
): Promise<GalleryResponse> {
  return api.get<GalleryResponse>(buildPersonGalleryPath(tmdbPersonId), {
    authenticated: false,
    signal,
  });
}
