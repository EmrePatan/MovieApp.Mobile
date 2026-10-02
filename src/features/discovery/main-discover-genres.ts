import type { Genre } from './types';

/** Main movie and TV genres. Membership and alphabetical order stay fixed. */
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
 * Extra catalog genres that can appear on Keşfet See All.
 * TV Movie and combined TV labels (Action & Adventure, Sci-Fi & Fantasy, War & Politics)
 * are intentionally absent — Kids, News, Reality, Soap, and Talk have their own names.
 */
export const DISCOVER_SEE_ALL_EXTRA_GENRE_NAMES = [
  'Documentary',
  'Family',
  'History',
  'Music',
  'War',
  'Western',
  'Kids',
  'News',
  'Reality',
  'Soap',
  'Talk',
] as const;

export type DiscoverSeeAllExtraGenreName = (typeof DISCOVER_SEE_ALL_EXTRA_GENRE_NAMES)[number];

export type DiscoverCatalogGenreName = MainDiscoverGenreName | DiscoverSeeAllExtraGenreName;

export const GENRE_HUB_RAIL_SIZE = 8;

/** Visible Keşfet rail, in this fixed order. */
export const GENRE_HUB_RAIL_GENRE_NAMES = [
  'Action',
  'Drama',
  'Comedy',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'War',
] as const satisfies readonly DiscoverCatalogGenreName[];

/**
 * See All lists the rail eight first, then the other main genres, then catalog extras.
 * War is only on the rail entry. Adventure is See All only.
 */
export const GENRE_HUB_SEE_ALL_GENRE_NAMES = [
  ...GENRE_HUB_RAIL_GENRE_NAMES,
  'Animation',
  'Crime',
  'Horror',
  'Thriller',
  'Adventure',
  'Documentary',
  'Family',
  'History',
  'Music',
  'Western',
  'Kids',
  'News',
  'Reality',
  'Soap',
  'Talk',
] as const satisfies readonly DiscoverCatalogGenreName[];

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

const LOCALIZED_SEE_ALL_EXTRA_GENRE_NAMES: Record<
  DiscoverSeeAllExtraGenreName,
  readonly string[]
> = {
  Documentary: ['Belgesel', 'Documental', 'Dokumentation', 'Documentaire', 'Documentario', 'Documentário'],
  Family: ['Aile', 'Familia', 'Familie', 'Famille', 'Famiglia', 'Família'],
  History: ['Tarih', 'Historia', 'Historie', 'Histoire', 'Storia', 'História'],
  Music: ['Müzik', 'Música', 'Musik', 'Musique', 'Musica'],
  War: ['Savaş', 'Bélica', 'Guerre', 'Guerra', 'Krieg'],
  Western: ['Kovboy', 'Faroeste'],
  Kids: ['Çocuk', 'Infantil', 'Enfants', 'Kinder', 'Bambini'],
  News: ['Haber', 'Noticias', 'Nachrichten', 'Actualités', 'Notizie', 'Notícias'],
  Reality: ['Gerçeklik', 'Télé-réalité'],
  Soap: ['Pembe Dizi', 'Telenovela', 'Feuilleton', 'Seifenoper', 'Novela'],
  Talk: ['Söyleşi', 'Entrevistas', 'Talk-show', 'Talkshow', 'Talk show'],
};

const aliasToCanonical = new Map<string, DiscoverCatalogGenreName>();

function normalizeGenreLabel(name: string): string {
  return name.trim().toLowerCase();
}

function registerGenreAlias(alias: string, canonical: DiscoverCatalogGenreName): void {
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

for (const canonical of DISCOVER_SEE_ALL_EXTRA_GENRE_NAMES) {
  registerGenreAlias(canonical, canonical);
  for (const alias of LOCALIZED_SEE_ALL_EXTRA_GENRE_NAMES[canonical]) {
    registerGenreAlias(alias, canonical);
  }
}

export function resolveDiscoverGenreCanonicalName(name: string): DiscoverCatalogGenreName | null {
  return aliasToCanonical.get(normalizeGenreLabel(name)) ?? null;
}

function isMainDiscoverGenreName(name: DiscoverCatalogGenreName): name is MainDiscoverGenreName {
  return (MAIN_DISCOVER_GENRE_NAMES as readonly string[]).includes(name);
}

export function selectMainDiscoverGenres(genres: readonly Genre[]): Genre[] {
  const selectedByCanonical = new Map<MainDiscoverGenreName, Genre>();

  for (const genre of genres) {
    const canonical = resolveDiscoverGenreCanonicalName(genre.name);
    if (!canonical || !isMainDiscoverGenreName(canonical) || selectedByCanonical.has(canonical)) {
      continue;
    }

    selectedByCanonical.set(canonical, genre);
  }

  return MAIN_DISCOVER_GENRE_NAMES.flatMap((name) => {
    const genre = selectedByCanonical.get(name);
    return genre ? [genre] : [];
  });
}

function selectGenresInOrder(
  genres: readonly Genre[],
  order: readonly DiscoverCatalogGenreName[],
): Genre[] {
  const allowed = new Set<DiscoverCatalogGenreName>(order);
  const selectedByCanonical = new Map<DiscoverCatalogGenreName, Genre>();

  for (const genre of genres) {
    const canonical = resolveDiscoverGenreCanonicalName(genre.name);
    if (!canonical || !allowed.has(canonical) || selectedByCanonical.has(canonical)) {
      continue;
    }

    selectedByCanonical.set(canonical, genre);
  }

  return order.flatMap((name) => {
    const genre = selectedByCanonical.get(name);
    return genre ? [genre] : [];
  });
}

function hasDiscoverCatalogGenre(genres: readonly Genre[]): boolean {
  return genres.some((genre) => resolveDiscoverGenreCanonicalName(genre.name) != null);
}

/** Main genres when they match; otherwise the genres the API actually returned. */
export function selectDiscoverHubGenres(genres: readonly Genre[]): Genre[] {
  const main = selectMainDiscoverGenres(genres);
  if (main.length > 0) {
    return main;
  }

  return genres.filter((genre) => genre.id.trim().length > 0 && genre.name.trim().length > 0);
}

/** Eight rail tiles. Unknown catalogs keep the previous fallback, capped at eight. */
export function selectGenreHubRailGenres(genres: readonly Genre[]): Genre[] {
  if (!hasDiscoverCatalogGenre(genres)) {
    return selectDiscoverHubGenres(genres).slice(0, GENRE_HUB_RAIL_SIZE);
  }

  return selectGenresInOrder(genres, GENRE_HUB_RAIL_GENRE_NAMES);
}

/** Every rail genre plus the See All-only genres, each canonical name at most once. */
export function selectGenreHubDirectoryGenres(genres: readonly Genre[]): Genre[] {
  if (!hasDiscoverCatalogGenre(genres)) {
    return selectDiscoverHubGenres(genres);
  }

  return selectGenresInOrder(genres, GENRE_HUB_SEE_ALL_GENRE_NAMES);
}
