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

export type MainDiscoverGenreName = (typeof MAIN_DISCOVER_GENRE_NAMES)[number];

/**
 * Labels `/api/genres` returns for Accept-Language locales other than en-US.
 * Catalog ids are GUIDs, not TMDB ids, so the hub matches these names.
 * Strings follow MovieApp GenreLocalization.
 */
const LOCALIZED_MAIN_GENRE_NAMES: Record<MainDiscoverGenreName, readonly string[]> = {
  Action: ['Aksiyon', 'Acción', 'Azione', 'Ação'],
  Adventure: ['Macera', 'Aventura', 'Abenteuer', 'Aventure', 'Avventura'],
  Animation: ['Animasyon', 'Animación', 'Animazione', 'Animação'],
  Comedy: ['Komedi', 'Comedia', 'Komödie', 'Comédie', 'Commedia', 'Comédia'],
  Crime: ['Suç', 'Crimen', 'Krimi'],
  Drama: ['Dram', 'Drame', 'Dramma'],
  Fantasy: ['Fantastik', 'Fantasía', 'Fantastique', 'Fantasia'],
  Horror: ['Korku', 'Terror', 'Horreur'],
  Mystery: ['Gizem', 'Misterio', 'Mystère', 'Mistero', 'Mistério'],
  Romance: ['Romantik', 'Liebesfilm', 'Romantico'],
  'Science Fiction': [
    'Bilim Kurgu',
    'Ciencia ficción',
    'Science-Fiction',
    'Science-fiction',
    'Fantascienza',
    'Ficção científica',
  ],
  Thriller: ['Gerilim', 'Suspense'],
};

const aliasToCanonical = new Map<string, MainDiscoverGenreName>();

function normalizeGenreLabel(name: string): string {
  return name.trim().toLowerCase();
}

function registerGenreAlias(alias: string, canonical: MainDiscoverGenreName): void {
  const key = normalizeGenreLabel(alias);
  if (!key) {
    return;
  }

  const existing = aliasToCanonical.get(key);
  if (existing && existing !== canonical) {
    throw new Error(`Genre alias "${alias}" maps to both ${existing} and ${canonical}`);
  }

  aliasToCanonical.set(key, canonical);
}

for (const canonical of MAIN_DISCOVER_GENRE_NAMES) {
  registerGenreAlias(canonical, canonical);
  for (const alias of LOCALIZED_MAIN_GENRE_NAMES[canonical]) {
    registerGenreAlias(alias, canonical);
  }
}

export function resolveDiscoverGenreCanonicalName(name: string): MainDiscoverGenreName | null {
  return aliasToCanonical.get(normalizeGenreLabel(name)) ?? null;
}

export function selectMainDiscoverGenres(genres: readonly Genre[]): Genre[] {
  const selectedByCanonical = new Map<MainDiscoverGenreName, Genre>();

  for (const genre of genres) {
    const canonical = resolveDiscoverGenreCanonicalName(genre.name);
    if (!canonical || selectedByCanonical.has(canonical)) {
      continue;
    }

    selectedByCanonical.set(canonical, genre);
  }

  return MAIN_DISCOVER_GENRE_NAMES.flatMap((name) => {
    const genre = selectedByCanonical.get(name);
    return genre ? [genre] : [];
  });
}

/** Main genres when they match; otherwise the genres the API actually returned. */
export function selectDiscoverHubGenres(genres: readonly Genre[]): Genre[] {
  const main = selectMainDiscoverGenres(genres);
  if (main.length > 0) {
    return main;
  }

  return genres.filter((genre) => genre.id.trim().length > 0 && genre.name.trim().length > 0);
}
