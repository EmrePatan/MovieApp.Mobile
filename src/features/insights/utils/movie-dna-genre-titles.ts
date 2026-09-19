import { translateMovieDnaGenreTitle } from '@/i18n/catalog-labels';

/** Canonical genre names from MovieApp TMDB maps (movie + TV). */
export const MOVIE_DNA_KNOWN_GENRE_NAMES = [
  'Action',
  'Adventure',
  'Action & Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Kids',
  'Music',
  'Mystery',
  'News',
  'Reality',
  'Romance',
  'Science Fiction',
  'Sci-Fi',
  'Sci-Fi & Fantasy',
  'Soap',
  'Talk',
  'TV Movie',
  'Thriller',
  'War',
  'War & Politics',
  'Western',
] as const;

export function normalizeMovieDnaGenreName(name: string): string {
  return name.trim().toLowerCase();
}

export function resolveMovieDnaGenreDisplayTitle(genreName: string): string {
  return translateMovieDnaGenreTitle(genreName);
}
