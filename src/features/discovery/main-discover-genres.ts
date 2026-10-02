import type { Genre } from './types';

/** Main movie and TV genres shown as poster-style tiles on Keşfet. */
export const MAIN_DISCOVER_GENRE_NAMES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
] as const;

export function selectMainDiscoverGenres(genres: readonly Genre[]): Genre[] {
  const byName = new Map(genres.map((genre) => [genre.name.trim().toLowerCase(), genre]));
  const selected: Genre[] = [];

  for (const name of MAIN_DISCOVER_GENRE_NAMES) {
    const match = byName.get(name.toLowerCase());
    if (!match || selected.some((genre) => genre.id === match.id)) {
      continue;
    }

    selected.push(match);
  }

  return selected;
}
