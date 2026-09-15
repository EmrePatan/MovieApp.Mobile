import { useQuery } from '@tanstack/react-query';
import { getMovieGallery, getPersonGallery, getTvShowGallery } from '../api/gallery-api';
import { galleryQueryKeys } from './gallery-query-keys';

const galleryStaleTime = 60_000;

export function useMovieGallery(movieId: string) {
  return useQuery({
    queryKey: galleryQueryKeys.movie(movieId),
    queryFn: ({ signal }) => getMovieGallery(movieId, signal),
    enabled: movieId.length > 0,
    staleTime: galleryStaleTime,
  });
}

export function useTvShowGallery(tvShowId: string) {
  return useQuery({
    queryKey: galleryQueryKeys.tv(tvShowId),
    queryFn: ({ signal }) => getTvShowGallery(tvShowId, signal),
    enabled: tvShowId.length > 0,
    staleTime: galleryStaleTime,
  });
}

export function usePersonGallery(tmdbPersonId: number) {
  return useQuery({
    queryKey: galleryQueryKeys.person(tmdbPersonId),
    queryFn: ({ signal }) => getPersonGallery(tmdbPersonId, signal),
    enabled: tmdbPersonId > 0,
    staleTime: galleryStaleTime,
  });
}
